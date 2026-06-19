-- ============================================================
-- DRAPEVA — SUPABASE SCHEMA ADDITIONS
-- Run this in Supabase SQL Editor AFTER supabase-schema.sql
-- ============================================================

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CUSTOMER ADDRESSES
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home', -- Home, Work, Other, Custom
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON customer_addresses(user_id);

-- Trigger to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE customer_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_default_address_set ON customer_addresses;
CREATE TRIGGER on_default_address_set
  BEFORE INSERT OR UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- Updated_at trigger
CREATE OR REPLACE TRIGGER customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON customer_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON customer_addresses FOR SELECT USING (is_admin());

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_category AS ENUM ('order_issue', 'payment', 'return_refund', 'product_query', 'delivery', 'account', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ticket_number TEXT UNIQUE NOT NULL DEFAULT 'TKT-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8)),
  subject TEXT NOT NULL,
  category ticket_category DEFAULT 'other',
  status ticket_status DEFAULT 'open',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);

CREATE OR REPLACE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can manage all tickets" ON support_tickets FOR ALL USING (is_admin());

CREATE POLICY "Users can view messages on own tickets" ON support_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can add messages to own tickets" ON support_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );
CREATE POLICY "Admins can manage all messages" ON support_messages FOR ALL USING (is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'order_placed', 'order_processing', 'order_shipped', 'order_delivered',
    'order_cancelled', 'order_returned', 'payment_success', 'payment_failed',
    'return_initiated', 'return_approved', 'return_rejected',
    'ticket_reply', 'account_update', 'promo', 'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- e.g., { order_id, ticket_id }
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System/admins can insert notifications" ON notifications FOR INSERT WITH CHECK (is_admin() OR auth.uid() IS NOT NULL);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL, -- e.g., 'order.status_update', 'product.create'
  resource_type TEXT NOT NULL, -- 'order', 'product', 'user', etc.
  resource_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order history" ON order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );
CREATE POLICY "Admins can manage order history" ON order_status_history FOR ALL USING (is_admin());

-- ============================================================
-- RETURN REQUESTS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'picked_up', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]', -- which items to return
  reason TEXT NOT NULL,
  comments TEXT,
  status return_status DEFAULT 'requested',
  refund_amount DECIMAL(12,2),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user ON return_requests(user_id);

CREATE OR REPLACE TRIGGER return_requests_updated_at
  BEFORE UPDATE ON return_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own returns" ON return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create returns" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all returns" ON return_requests FOR ALL USING (is_admin());

-- ============================================================
-- HELPER: Promote user to admin
-- Usage: SELECT make_admin('user@example.com');
-- ============================================================

CREATE OR REPLACE FUNCTION make_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE profiles SET role = 'admin' WHERE email = user_email;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count = 0 THEN
    RETURN 'No user found with email: ' || user_email;
  END IF;
  RETURN 'SUCCESS: ' || user_email || ' is now an admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Auto-notify on order status change
-- ============================================================

CREATE OR REPLACE FUNCTION notify_on_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notif_type notification_type;
  notif_title TEXT;
  notif_msg TEXT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Map status to notification type
  CASE NEW.status
    WHEN 'processing' THEN
      notif_type := 'order_processing';
      notif_title := 'Order Confirmed';
      notif_msg := 'Your order #' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)) || ' is being processed.';
    WHEN 'shipped' THEN
      notif_type := 'order_shipped';
      notif_title := 'Order Shipped';
      notif_msg := 'Your order #' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)) || ' has been shipped!' ||
        CASE WHEN NEW.tracking_number IS NOT NULL THEN ' Tracking: ' || NEW.tracking_number ELSE '' END;
    WHEN 'delivered' THEN
      notif_type := 'order_delivered';
      notif_title := 'Order Delivered';
      notif_msg := 'Your order #' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)) || ' has been delivered. Enjoy your saree!';
    WHEN 'cancelled' THEN
      notif_type := 'order_cancelled';
      notif_title := 'Order Cancelled';
      notif_msg := 'Your order #' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)) || ' has been cancelled.';
    ELSE
      RETURN NEW;
  END CASE;

  -- Insert notification if user exists
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (NEW.user_id, notif_type, notif_title, notif_msg, jsonb_build_object('order_id', NEW.id));
  END IF;

  -- Insert status history
  INSERT INTO order_status_history (order_id, status, note)
  VALUES (NEW.id, NEW.status::TEXT, 'Status updated to ' || NEW.status);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_on_order_status_change();

-- ============================================================
-- FIX: REVIEWS TO PROFILES FOREIGN KEY FOR POSTGREST
-- ============================================================

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_user_id_profiles;
ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews_user_id_profiles
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;


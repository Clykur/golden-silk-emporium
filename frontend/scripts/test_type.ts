import type { Database, MakeDatabaseCompat } from "../lib/types";
import type { supabase } from "../lib/supabase";

// Inspecting types
type CompatDb = MakeDatabaseCompat<Database>;
type ProfileTable = CompatDb["public"]["Tables"]["profiles"];
type ProfileRow = ProfileTable["Row"];
type ProfileInsert = ProfileTable["Insert"];
type ProfileUpdate = ProfileTable["Update"];

const row: ProfileRow = {} as any;
const insert: ProfileInsert = {} as any;
const update: ProfileUpdate = {} as any;

console.log("Types loaded");

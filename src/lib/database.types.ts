// Generated from the local Supabase schema. Do not edit by hand.
// Regenerate with: pnpm db:types

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			exercises: {
				Row: {
					current_step_index: number;
					icon: string | null;
					id: string;
					name: string;
					type: string | null;
					user_id: string;
				};
				Insert: {
					current_step_index?: number;
					icon?: string | null;
					id?: string;
					name: string;
					type?: string | null;
					user_id?: string;
				};
				Update: {
					current_step_index?: number;
					icon?: string | null;
					id?: string;
					name?: string;
					type?: string | null;
					user_id?: string;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					avatar_url: string | null;
					display_name: string | null;
					full_name: string | null;
					id: string;
					updated_at: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					display_name?: string | null;
					full_name?: string | null;
					id: string;
					updated_at?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					display_name?: string | null;
					full_name?: string | null;
					id?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			steps: {
				Row: {
					completed: boolean;
					completed_at: string | null;
					description: string;
					exercise_id: string;
					id: string;
					step_index: number;
				};
				Insert: {
					completed?: boolean;
					completed_at?: string | null;
					description: string;
					exercise_id: string;
					id?: string;
					step_index?: number;
				};
				Update: {
					completed?: boolean;
					completed_at?: string | null;
					description?: string;
					exercise_id?: string;
					id?: string;
					step_index?: number;
				};
				Relationships: [
					{
						foreignKeyName: "steps_exercise_id_fkey";
						columns: ["exercise_id"];
						isOneToOne: false;
						referencedRelation: "exercises";
						referencedColumns: ["id"];
					},
				];
			};
			training_sessions: {
				Row: {
					completed_at: string;
					exercises: Json;
					id: string;
					liked: boolean;
					notes: string | null;
					user_id: string;
				};
				Insert: {
					completed_at?: string;
					exercises?: Json;
					id?: string;
					liked?: boolean;
					notes?: string | null;
					user_id?: string;
				};
				Update: {
					completed_at?: string;
					exercises?: Json;
					id?: string;
					liked?: boolean;
					notes?: string | null;
					user_id?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<never, never>;
		Functions: {
			get_admin_sessions: {
				Args: Record<PropertyKey, never>;
				Returns: {
					avatar_url: string | null;
					completed_at: string;
					display_name: string | null;
					exercises: Json;
					full_name: string | null;
					id: string;
					liked: boolean;
					notes: string | null;
					user_id: string;
				}[];
			};
		};
		Enums: Record<never, never>;
		CompositeTypes: Record<never, never>;
	};
};

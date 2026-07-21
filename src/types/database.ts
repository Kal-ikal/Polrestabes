export type AssetStatus = "tersedia" | "dipinjam" | "rusak";
export type BorrowStatus =
  | "menunggu_persetujuan"
  | "disetujui"
  | "ditolak"
  | "dikembalikan";
export type ReturnCondition = "baik" | "rusak";

export interface Profile {
  id: string;
  full_name: string;
  nrp: string | null;
  phone: string | null;
  role: "petugas" | "admin";
  created_at: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  serial_number: string;
  status: AssetStatus;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BorrowTransaction {
  id: string;
  asset_id: string;
  user_id: string;
  status: BorrowStatus;
  purpose: string;
  borrowed_at: string | null;
  due_at: string | null;
  returned_at: string | null;
  approved_by: string | null;
  condition_on_return: ReturnCondition | null;
  created_at: string;
  updated_at: string;
  // relasi (kalau di-join)
  asset?: Asset;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      assets: {
        Row: Asset;
        Insert: Partial<Asset>;
        Update: Partial<Asset>;
        Relationships: [];
      };
      borrow_transactions: {
        Row: BorrowTransaction;
        Insert: Partial<BorrowTransaction>;
        Update: Partial<BorrowTransaction>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      request_borrow: {
        Args: {
          p_asset_id: string;
          p_purpose: string;
          p_due_at: string;
        };
        Returns: unknown;
      };
      request_return: {
        Args: {
          p_transaction_id: string;
          p_condition: ReturnCondition;
        };
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

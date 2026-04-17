
User wants a simple migration to widen 4 columns from VARCHAR(n) to TEXT. SSN is already TEXT in the schema. The other three (cdl_state, state, zip_code) are character varying without a stated limit but user reports value-length failures — converting to TEXT is safe and idempotent.

No code changes needed — TypeScript types treat varchar and text the same (string).

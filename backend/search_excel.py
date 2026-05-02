import pandas as pd
import sys

def search_excel(file_path, search_term):
    try:
        xls = pd.ExcelFile(file_path)
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name)
            # Search across all columns
            mask = df.astype(str).apply(lambda x: x.str.contains(search_term, case=False, na=False))
            rows_with_term = df[mask.any(axis=1)]
            if not rows_with_term.empty:
                print(f"--- Found in sheet: {sheet_name} ---")
                print(rows_with_term)
                
    except Exception as e:
        print(f"Error reading Excel file: {e}")

if __name__ == "__main__":
    search_excel('Skills.xlsx', 'deploy')

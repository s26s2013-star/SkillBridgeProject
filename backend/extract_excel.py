import pandas as pd

def extract_excel_text(filepath, output_file):
    try:
        xls = pd.ExcelFile(filepath)
        with open(output_file, 'w', encoding='utf-8') as f:
            for sheet in xls.sheet_names:
                df = pd.read_excel(xls, sheet_name=sheet)
                f.write(f"--- SHEET: {sheet} ---\n")
                f.write(df.to_string())
                f.write("\n\n")
        print(f"Extraction successful to {output_file}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_excel_text("Skills.xlsx", "excel_dump.txt")

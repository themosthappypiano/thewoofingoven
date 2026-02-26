#!/usr/bin/env python3
import csv
import os
from supabase import create_client

# Supabase config
url = "https://kksziefdwuczqvzgffxn.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44"
supabase = create_client(url, key)

def import_csv():
    csv_path = "/home/errr/Downloads/products_export_1.csv"
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        products_added = {}
        
        for row in reader:
            handle = row['Handle']
            if not handle:
                continue
                
            # Skip if we already added this product
            if handle in products_added:
                continue
                
            # Create simple product
            product = {
                'name': row['Title'] or handle,
                'description': (row['Body (HTML)'] or '').replace('<p>', '').replace('</p>', '').replace('<br>', '\n')[:500],
                'base_price': float(row['Variant Price']) if row['Variant Price'] else 10.0,
                'image_url': row['Image Src'] or 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=800',
                'category': 'cake' if 'cake' in row['Type'].lower() else 'treat',
                'is_featured': 'barkday' in (row['Tags'] or '').lower(),
                'tags': row['Tags'] or '',
            }
            
            try:
                result = supabase.table('products').insert(product).execute()
                print(f"✅ Added: {product['name']}")
                products_added[handle] = True
            except Exception as e:
                print(f"❌ Error adding {product['name']}: {e}")

if __name__ == "__main__":
    import_csv()
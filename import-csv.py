#!/usr/bin/env python3
"""
Import Shopify CSV to Supabase with column mapping
"""
import csv
import os
from supabase import create_client, Client

# Supabase configuration
url = "https://kksziefdwuczqvzgffxn.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3ppZWZkd3VjenF2emdmZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTYxMDgsImV4cCI6MjA4NzUzMjEwOH0.8mzksLR6wfYY70BIyByeLgoc3thofj42uJHJloJsF44"

supabase: Client = create_client(url, key)

# Column mapping from CSV headers to database columns
column_mapping = {
    "Handle": "handle",
    "Title": "title", 
    "Body (HTML)": "body_html",
    "Vendor": "vendor",
    "Product Category": "product_category",
    "Type": "type",
    "Tags": "tags",
    "Published": "published",
    "Option1 Name": "option1_name",
    "Option1 Value": "option1_value",
    "Option1 Linked To": "option1_linked_to",
    "Option2 Name": "option2_name",
    "Option2 Value": "option2_value", 
    "Option2 Linked To": "option2_linked_to",
    "Option3 Name": "option3_name",
    "Option3 Value": "option3_value",
    "Option3 Linked To": "option3_linked_to",
    "Variant SKU": "variant_sku",
    "Variant Grams": "variant_grams",
    "Variant Inventory Tracker": "variant_inventory_tracker",
    "Variant Inventory Policy": "variant_inventory_policy", 
    "Variant Fulfillment Service": "variant_fulfillment_service",
    "Variant Price": "variant_price",
    "Variant Compare At Price": "variant_compare_at_price",
    "Variant Requires Shipping": "variant_requires_shipping",
    "Variant Taxable": "variant_taxable",
    "Unit Price Total Measure": "unit_price_total_measure",
    "Unit Price Total Measure Unit": "unit_price_total_measure_unit",
    "Unit Price Base Measure": "unit_price_base_measure",
    "Unit Price Base Measure Unit": "unit_price_base_measure_unit", 
    "Variant Barcode": "variant_barcode",
    "Image Src": "image_src",
    "Image Position": "image_position",
    "Image Alt Text": "image_alt_text",
    "Gift Card": "gift_card", 
    "SEO Title": "seo_title",
    "SEO Description": "seo_description",
    "Dog age group (product.metafields.shopify.dog-age-group)": "dog_age_group",
    "Pet dietary requirements (product.metafields.shopify.pet-dietary-requirements)": "pet_dietary_requirements",
    "Pet food flavor (product.metafields.shopify.pet-food-flavor)": "pet_food_flavor",
    "Pet treat texture (product.metafields.shopify.pet-treat-texture)": "pet_treat_texture",
    "Variant Image": "variant_image",
    "Variant Weight Unit": "variant_weight_unit",
    "Variant Tax Code": "variant_tax_code",
    "Cost per item": "cost_per_item",
    "Status": "status"
}

def convert_value(value, field_name):
    """Convert CSV values to appropriate types"""
    if not value or value.strip() == "":
        return None
    
    # Boolean fields
    if field_name in ["published", "variant_requires_shipping", "variant_taxable", "gift_card"]:
        return value.lower() in ["true", "1", "yes"]
    
    # Numeric fields
    if field_name in ["variant_grams", "variant_price", "variant_compare_at_price", "image_position", "cost_per_item"]:
        try:
            if "." in value:
                return float(value)
            else:
                return int(value)
        except (ValueError, TypeError):
            return None
    
    return value.strip()

def import_csv(csv_path):
    """Import CSV file to Supabase"""
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            batch = []
            batch_size = 100
            total_rows = 0
            
            for row in reader:
                # Map CSV columns to database columns
                mapped_row = {}
                for csv_col, db_col in column_mapping.items():
                    if csv_col in row:
                        mapped_row[db_col] = convert_value(row[csv_col], db_col)
                
                batch.append(mapped_row)
                total_rows += 1
                
                # Insert in batches
                if len(batch) >= batch_size:
                    result = supabase.table('shopify_products').insert(batch).execute()
                    print(f"Inserted batch of {len(batch)} rows")
                    batch = []
            
            # Insert remaining rows
            if batch:
                result = supabase.table('shopify_products').insert(batch).execute()
                print(f"Inserted final batch of {len(batch)} rows")
            
            print(f"✅ Successfully imported {total_rows} rows")
            
    except Exception as e:
        print(f"❌ Error importing CSV: {e}")

if __name__ == "__main__":
    csv_path = "/home/errr/Downloads/products_export_1.csv"
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
    else:
        print(f"🚀 Starting import of {csv_path}")
        import_csv(csv_path)
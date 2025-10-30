import json
import os
from datetime import datetime

# Always use the script's folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "reflections.json")

def add_reflection():
    print("=== Add New Reflection ===")
    
    # Ask user for input
    name = input("Enter your name: ")
    reflection_text = input("Enter your reflection: ")
    
    # New reflection to add
    new_reflection = {
        "name": name,
        "date": datetime.now().strftime("%a %b %d %Y"),
        "reflection": reflection_text
    }
    
    # Load existing data
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding='utf-8') as f:
            try:
                reflections = json.load(f)
            except json.JSONDecodeError:
                reflections = []
    else:
        reflections = []
    
    # Append new entry
    reflections.append(new_reflection)
    
    # Save back to JSON
    with open(DATA_FILE, "w", encoding='utf-8') as f:
        json.dump(reflections, f, indent=2)
    
    print(f"✅ Reflection added successfully! Total reflections: {len(reflections)}")

def view_reflections():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding='utf-8') as f:
            try:
                reflections = json.load(f)
                print(f"\n=== Reflections ({len(reflections)} entries) ===")
                for i, reflection in enumerate(reflections, 1):
                    print(f"\n{i}. {reflection['date']} - {reflection['name']}")
                    print(f"   {reflection['reflection']}")
            except json.JSONDecodeError:
                print("No reflections found or file is empty.")
    else:
        print("No reflections file found.")

def main():
    while True:
        print("\n" + "="*40)
        print("    LEARNING JOURNAL - PYTHON BACKEND")
        print("="*40)
        print("1. Add New Reflection")
        print("2. View All Reflections")
        print("3. Exit")
        
        choice = input("\nChoose an option (1-3): ").strip()
        
        if choice == '1':
            add_reflection()
        elif choice == '2':
            view_reflections()
        elif choice == '3':
            print("Goodbye! 👋")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
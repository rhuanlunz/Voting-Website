from json       import load
from pathlib    import Path
import sqlite3

# Define database path
DATABASE_PATH = Path(__file__).parent / "database.db"

# Initialize the database and table
def initialize() -> None:
    try:
        with sqlite3.connect(DATABASE_PATH) as db:
            cursor = db.cursor()

            cursor.execute("DROP TABLE IF EXISTS Tokens")
            cursor.execute("DROP TABLE IF EXISTS Projects")

            # Create the tables (already handled in this function)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Tokens (
                    token TEXT PRIMARY KEY,
                    vote INTEGER
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Projects (
                    id INTEGER PRIMARY KEY,
                    name TEXT
                )
            """)

            projects = load_projects()
            for i in range(len(projects)):
                cursor.execute("""
                    INSERT INTO Projects VALUES (?, ?)
                """, (i, projects[i]["title"]))

            db.commit()

    except sqlite3.OperationalError as e:
        print(f"Database error: {e}")


# Load projects data from JSON file
def load_projects() -> None:
    try:
        with open("projects.json", "r") as f:
            return load(f)
    except FileNotFoundError:
        print("Project data not found, please create it.")

# Analyze and print the results of the project votes
def analyze_votes() -> None:

    # Load projects and vote data
    with sqlite3.connect(DATABASE_PATH) as db:
        cursor = db.cursor()

        projects_data = cursor.execute("SELECT id, name FROM Projects").fetchall()  # Get Projects data
        votes_data = cursor.execute("SELECT vote FROM Tokens").fetchall()  # Get vote data
        votes: dict = {}

        for i in range(len(projects_data)):
            votes[projects_data[i][1]] = votes_data.count((i, ))

        rank = sorted(votes.items(), key=lambda item: item[1], reverse=True)
        for i in range(len(rank)):
            print(f"{i + 1}. {rank[i][0]} - {rank[i][1]}")

        print(f"\n{len(votes_data)} QR-Codes was generated!")
        print(f"{votes_data.count((-1,))} did not vote!")

# Function to handle user input and operations
def handle_input() -> None:
    while True:
        opc = input("\nChoose an option:\n"
                     "0 - Initialize Database and Projects \n"
                     "1 - Read Data\n"
                     "> ")

        match opc:
            case '0':  # Initialize Database and Projects
                try:
                    initialize()
                    print("Initialization complete!")
                    break
                except sqlite3.OperationalError as e:
                   print(f"Database error: {e}")
                   continue

            case '1':  # Read data
                analyze_votes()
                break

if __name__ == "__main__":
    handle_input()
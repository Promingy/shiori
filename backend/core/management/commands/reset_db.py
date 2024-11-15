import os
import django
from django.core.management.base import BaseCommand
from django.db import connections
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Deletes the db.sqlite3 file, runs makemigrations, migrate, and imports the APKG'

    def handle(self, *args, **kwargs):
        # Path to your SQLite database
        db_path = os.path.join(os.getcwd(), 'db.sqlite3')

        # Check if the database exists and delete it
        if os.path.exists(db_path):
            os.remove(db_path)
            self.stdout.write(self.style.SUCCESS('Successfully deleted db.sqlite3'))
        else:
            self.stdout.write(self.style.WARNING('db.sqlite3 does not exist'))

        # Run migrations and makemigrations
        self.stdout.write(self.style.SUCCESS('Running makemigrations...'))
        call_command('makemigrations')

        self.stdout.write(self.style.SUCCESS('Running migrate...'))
        call_command('migrate')

        # Import APKG (you may need to import your custom import function here)
        self.stdout.write(self.style.SUCCESS('Importing APKG data...'))
        # Assuming `import_apkg` is a custom function or management command you have already defined
        # Replace the following line with your actual APKG import logic or command call
        call_command('import_apkg')  # or call the function directly

        self.stdout.write(self.style.SUCCESS('Database reset and APKG import complete!'))

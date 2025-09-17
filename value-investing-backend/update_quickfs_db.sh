#!/bin/bash


#activate virtual environment
#source /Users/pa/.virtualenvs/dcf/bin/activate
source /Users/pa/.virtualenvs/.value_investing/bin/activate

#print the currently active virtual environment
if [[ -n "$VIRTUAL_ENV" ]]; then
    echo "Active Virtual Environment: $VIRTUAL_ENV"
fi

# Navigate to the script directory of download_quickfs.py
cd /Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/

# Run the first Python script (download_quickfs.py)
python3 download_quickfs_data.py
#python3 testing_data.py


echo "Exit status: $?"

# Check if the first script executed successfully
if [ $? -eq 0 ]; then
    echo "Download completed successfully. Running the second script..."

    # Run the second Python script that migrates the data to the database
    python3 /Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/migrations/quickfs_database/main.py
    
    echo "Database migrated successfully. Running django management command..."

    #change the folder to the django project to execute management command
    cd /Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/valueinvesting

    #migrate close prices
    python3 manage.py migrate_close_prices

    #migrate operating assets and liabilities
    python3 manage.py migrate_operating_assets_and_liabilities

    #migrate valuation data
    python3 manage.py migrate_valuation_data

    #migrate screener data
    python3 manage.py migrate_screener_data
else
    echo "ERROR downloading data. Skipping the data migration script."
    exit 1
fi

echo "All tasks completed."

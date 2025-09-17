print('we are in download data')


import os
import sys
import shutil
import requests
import zipfile
from io import BytesIO
import logging
from dotenv import load_dotenv
load_dotenv()

# URL and destination paths
# url = f"https://patrickfabianamstad@gmail.com:{os.environ['QUICKFS_DB_KEY']}@api.quickfs.net/bulk-data-downloads/premium/bulk_downloads_australia.zip"
destination_folder = "/Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/migrations/quickfs_database/Data/Australia"

# Define the log file path
log_file = "/Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/migrations/quickfs_database/logs/update_quickfs_database.job.stdout"

# Ensure the directory exists
os.makedirs(os.path.dirname(log_file), exist_ok=True)

# Configure logging
logging.basicConfig(
    filename=log_file,  # Log file path
    filemode='a',  # Append mode
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format
    level=logging.INFO  # Logging level
)

def get_download_url(country):
    """Returns the download url for the data. Possible values for country are: canada, australia, unitedkingdom, europe, usa"""
    if country.lower() == "usa":
        return f"https://patrickfabianamstad@gmail.com:{os.environ['QUICKFS_DB_KEY']}@api.quickfs.net/bulk-data-downloads/premium/bulk_downloads.zip"
    elif country.lower() in ["canada", "australia", "unitedkingdom", "europe"]:
        return f"https://patrickfabianamstad@gmail.com:{os.environ['QUICKFS_DB_KEY']}@api.quickfs.net/bulk-data-downloads/premium/bulk_downloads_{country.lower()}.zip"
    else:
        raise Exception(f"ERROR: get_download_url given country {country} is not valid. Valid values are: canada, australia, unitedkingdom, europe, usa")

def get_destination_folder(country):
    """Returns the destination folder where the download data should be stored. possible values are: canada, australia, unitedkingdom, europe, usa"""
    if country.lower() in ["canada", "australia", "unitedkingdom", "europe", "usa"]:
        return f"/Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/migrations/quickfs_database/Data/{country}"
    else:
        raise Exception(f"ERROR: get_destination_folder, given country {country} is not valid. Valid values are: canada, australia, unitedkingdom, europe, usa")

def clear_folder(folder_path):
    """Deletes all files and folders inside a given folder."""
    if os.path.exists(folder_path):
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)  # Remove file or symlink
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)  # Remove directory
            except Exception as e:
                print(f"Failed to delete {file_path}: {e}")
    else:
        os.makedirs(folder_path)

def download_and_extract_zip(url, destination):
    """Downloads a ZIP file and extracts it to the destination folder."""
    response = requests.get(url, stream=True)
    
    if response.status_code == 200:
        with zipfile.ZipFile(BytesIO(response.content)) as zip_ref:
            zip_ref.extractall(destination)
        logging.info(f"Files successfully downloaded and extracted to {destination}")
    else:
        logging.info(f"Failed to download file: {response.status_code}")

# def main():
countries = ["canada", "australia", "unitedkingdom", "europe", "usa"]

for country in countries:
    # print(f"START downloading data for {country}")
    logging.info(f"START downloading data for {country}")

    #get destinaion folder and download url
    destination_folder = get_destination_folder(country)
    download_url = get_download_url(country)

    #delete any existing files and folder in destination folder
    clear_folder(destination_folder)
    download_and_extract_zip(download_url, destination_folder)

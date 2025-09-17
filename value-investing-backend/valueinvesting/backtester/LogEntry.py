
from datetime import datetime
import time

def create_info_log_entry(log_entry):
    """
    Prints log_entry to the console in the following format:

    #####################################################################
    Datetime: Here comes some message
    #####################################################################
    """
    log_message = f"""#####################################################################
{datetime.now()}: {log_entry}
#####################################################################
    """
    print(log_message)

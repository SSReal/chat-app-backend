# API Back-End to support multiple users, pages and views
```Made by Sajal Singhal```  
This is a simple but extensible api to support a database consisting of multiple users, pages and views.
## Structure
- Each user has a username and can have a secret (password), and zero or more pages
- Each page may consist of multiple views.
- Each view can be individually protected by a viewSecret and is an abstraction that can be used for any type of data storage
- Encryption, Decryption of data is to be handled by the client, the server just provides validation of user and view keys

## Features
- Users have a default page which is automatically returned if the user is getted.
- Pages have a default view which is automatically returned if the page is getted.
- Users, pages, and views can be deleted by sending a delete request
- For updating data, {update: true} needs to be sent along with the updated user/page/view in a post request
- For creating data, post requests with no update flag are to be sent, either with or without some defaults for the data


## API Endpoints
- The endpoints are structured as follows:
    - /username:
        create, update, delete or view a user.
        viewing will redirect to the default view of the default page.
    - /username/page:
        create, update, delete or view a page.
        viewing will redirect to the default view.
    - /username/page/view:
        create, update, delete or view a view.
        vieweing will return the contents of the view, as they are.


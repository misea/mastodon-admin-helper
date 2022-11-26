## sciences.social admin helper
This repository contains a browser extension to make the lives of sciences.social admins slightly easier. Right now all it does is augment the list of pending accounts with notes that have been added to the individual accounts. 

Currently the extension only works in Chrome and Brave browsers, though very minor changes to the manifest file should allow it to work in Firefox.  The extension is not available in the web store, so the only way to install it is in "developer mode". Download and unzip the repository into a folder. In chrome go to chrome://extensions/ and turn on developer mode. Then use the Load Unpacked button to point to the directory and it should be installed. For Brave go to brave://extensions/ and do the same thing.

## How it works
I couldn't find an API to read those notes so the extension installs some code in the /admin/accounts page which goes through all the pending accounts and loads notes from the individual's detailed page. Because I don't want to do a large number of requests the extension only makes one request every 0.5 seconds and caches results in local storage (for 5 minutes if there are no notes and for 12 hours if there are). It also updates local storage whenever going to a users detail page. 

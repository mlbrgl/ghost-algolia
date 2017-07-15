# Ghost / Algolia integration

This app enables [Ghost](https://ghost.org) sites owners to index their content through [Algolia](https://www.algolia.com).

*Disclaimer: Ghost apps are not mature as of July 2017 (https://github.com/TryGhost/Ghost/wiki/Apps-Getting-Started-for-Ghost-Devs). As a result, this app is merely using the "app" denomination to set its intention but does not leverage any part of the burgeoning App framework yet. Hooking into Ghost thus requires patching core for now, a workaround which will be removed as soon as the App framework is rolled out and makes this step unnecessary.*

# What it does

When you work on a story, and publish it, the content of that story is sent to Algolia's indexing engine. Any change you make to that story or its state afterwards (updating content, deleting the story or unpublishing it) is automatically synchronised with your index.

# What it does not do

This app only deals with the indexing side of things. Adding the actual search widget is not part of the scope at this point. A good option to look into is [InstantSearch.js](https://community.algolia.com/instantsearch.js/v2/).

# Installation

1. Place the app code in the `[PATH_TO_GHOST_ROOT]/content/apps` folder so that the index.js file can be found at this location: `[PATH_TO_GHOST_ROOT]/content/apps/ghost-algolia/index.js`.

2. Install dependencies by running `yarn`(recommended) or `npm install` in the app folder.

3. Locate your ghost config file (config.production.json if ghost is running in production mode) and append the algolia object to it:

   ```json
   "algolia": {
       "applicationID": "[YOUR_ALGOLIA_APP_ID]",
       "apiKey": "[YOUR_ALGOLIA_API_KEY]",
       "index": "[YOUR_ALGOLIA_INDEX]"
     }
   ```

   *NB: you want to make sure that the generated apiKey has write access to your index. Please refer to Algolia's documentation for more information.*

4. Apply the `ghost_algolia_register_events.patch` patch found in the app download by running the following command from the ghost root:

   ```shell
   patch -p1 < ./content/apps/ghost-algolia/ghost_algolia_register_events.patch
   ```

5. Restart ghost


# Usage

Triggering indexing is transparent once the app is installed and happens on the following ghost panel operations:

- publishing a new post (add a new record)
- updating a published post (update an existing record)
- unpublishing a post (remove a record)
- deleting a post (remove a record)

# Roadmap

- Switching to [fragment indexing](https://github.com/mlbrgl/kirby-algolia#principle).
- Bulk indexing existing articles.
- Upgrade to App API when available, to remove core hacking and simplify the installation process.
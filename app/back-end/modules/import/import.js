/*
 * Class used to import data from WP to Publii using WXR file
 */

const fs = require('fs-extra');
const path = require('path');
const WxrParser = require('./wxr-parser');
const sql = require('../../vendor/sql.js');

class Import {
    /**
     * Creates an instance
     *
     * @param appInstance
     * @param siteName
     * @param filePath
     */
    constructor(appInstance, siteName, filePath) {
        this.appInstance = appInstance;
        this.siteName = siteName;
        this.filePath = filePath;
        this.connectWithDB();

        this.parser = new WxrParser(appInstance, siteName);
        this.parser.loadFile(this.filePath);
    }

    /**
     * Creates DB instance for the importer
     */
    connectWithDB() {
        if(!this.appInstance) {
            return;
        }

        const dbFilePath = path.join(this.appInstance.sitesDir, this.siteName, 'input', 'db.sqlite');
        const input = fs.readFileSync(dbFilePath);
        this.appInstance.db = new sql.Database(input);
    }

    /**
     * Checks the file
     *
     * @returns {*}
     */
    checkFile() {
        if (this.parser.isWXR()) {
            let result = this.parser.getWxrStats();

            if(result) {
                return {
                    status: 'success',
                    message: result
                };
            }

            return {
                status: 'error',
                message: 'An error occurred during parsing selected WXR file'
            }
        }

        return {
            status: 'error',
            message: 'Selected file is not a proper WXR file.'
        };
    }

    /**
     * Imports data from the given WXR file
     *
     * @param importAuthors
     * @param usedTaxonomy
     * @returns {{status: string, message: boolean}}
     */
    importFile(importAuthors, usedTaxonomy, autop, postTypes) {
        console.log('(i) Import started');
        this.parser.setConfig(importAuthors, usedTaxonomy, autop, postTypes);
        this.parser.importAuthorsData();
        this.parser.importTagsData();
        this.parser.getImageURLs();
        this.parser.importPostsData();
        this.parser.importImages();
    }
}

module.exports = Import;

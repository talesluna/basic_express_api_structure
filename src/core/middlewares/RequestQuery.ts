import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';


/**
 * @description Default values to use in express middleware
 * @type {{limit: number, page: number, project: Object}}
 */
const defaults = {
    limit   : 100,
    page    : 1,
    project : {
        __v : false
    }
};


/**
 * @description Middleware for parse request URL queries
 */
export default class RequestQuery {


    /**
     * @description Middleware for parse items of req.query
     *
     * @param {*} req
     * @param {*} res
     * @param {VoidFunction} next
     */
    protected parseQuery (req: Request, res: Response, next: NextFunction) {

        // Set default project (is overridden if exist 'select' in req.query)
        req.query.project = defaults.project;

        // Parse select fields
        // Usage: ?select=field1,field2
        if ('select' in req.query) {

            // Mount array of select query fields
            req.query.select    = req.query.select.split(',');

            // Clear project object to insert same fields of select
            req.query.project   = {};

            // Increment project object with select fields
            req.query.select.forEach((item: string) => {
                req.query.project[item] = true;
            });
        }


        // Parse where fields
        // Usage: ?where={"field1":"value", "field2": "value"}
        req.query.where = 'where' in req.query
            ? JSON.parse(req.query.where)
            : {};

        // Detect ObjectID in where (for MongoDB)
        Object.keys(req.query.where).forEach((item: string) => {
            if (mongoose.Types.ObjectId.isValid(req.query.where[item])) {
                req.query.where[item] = mongoose.Types.ObjectId(req.query.where[item]);
            }
        });


        // Parse limit
        // Usage: ?limit=10
        req.query.limit = 'limit' in req.query
            ? Math.min(parseInt(req.query.limit, Infinity), defaults.limit)
            : defaults.limit;


        // Parse page
        // Usage: ?page=1
        req.query.page = 'page' in req.query
            ? parseInt(req.query.page, Infinity)
            : defaults.page;


        // Parse offset
        // Usage: ?offset=20
        req.query.offset = 'offset' in req.query
            ? parseInt(req.query.offset, Infinity)
            : req.query.limit *  (req.query.page - 1);

        // Continue...
        next();
    }

}

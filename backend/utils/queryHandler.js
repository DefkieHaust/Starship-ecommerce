class QueryHandler {
    constructor(query, queryOpts) {
        this.query = query;
        this.queryOpts = queryOpts;
    }
    //   search functionalty
    search() {
        const keyword = this.queryOpts.keyword ? {
            name: {
                $regex: this.queryOpts.keyword,
                $options: "i",
            },
        } : {};

    this.query = this.query.find({ ...keyword });
    return this;
    }

    //   filter functionalty
    filter() {
        const queryCopy = { ...this.queryOpts };
        const removeFields = ["page", "keyword", "limit"];

        removeFields.forEach((key) => {
            delete queryCopy[key];
        });
    
        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (key) => `$${key}`
        );

        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    //   pagination;
    pagination() {
        const currentPage = Number(this.queryOpts.page) || 1;
        const skip = (currentPage - 1) * this.queryOpts.limit;

        this.query = this.query.limit(this.queryOpts.limit).skip(skip);

        return this;
    }

    // resolve
    resolve() {
        this.search().filter().pagination()

        return this
    }
}

module.exports = QueryHandler;

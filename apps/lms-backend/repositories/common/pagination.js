class Paginator {
    maxLimit = 50;

    constructor(page, limit) {
        this._rawPage = Math.abs(parseInt(page)) || 1;
        this._rawLimit = Math.abs(parseInt(limit)) || 10;
    }

    get limit() {
        return this._rawLimit > this.maxLimit ? this.maxLimit : this._rawLimit;
    }

    get page() {
        return this._rawPage >= 1 ? this._rawPage - 1 : 0;
    }

    get offset() {
        return this.page * this.limit;
    }

    get paginationInfo() {
        return { limit: this.limit, offset: this.offset, page: this.page + 1 };
    }
}

module.exports = {
    Paginator
};
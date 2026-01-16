const cds = require('@sap/cds');

class CatalogService extends cds.ApplicationService {
    async init() {
        const { Products, Customers } = this.entities;

        // Constants for business logic
        const HIGH_STOCK_THRESHOLD = 111;
        const DISCOUNT_MESSAGE = ' -- 11% discount!';

        // Add some discount for overstocked products
        this.after('READ', Products, each => {
            if (each.stock > HIGH_STOCK_THRESHOLD) {
                each.name += DISCOUNT_MESSAGE;
            }
        });

        const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

        this.before(['CREATE', 'UPDATE'], Customers, (req) => {
            const { name, contact, email } = req.data || {};

            if (req.event === 'CREATE') {
                if (!isNonEmptyString(name)) req.error(400, 'Campo obrigatório: name');
                if (!isNonEmptyString(contact)) req.error(400, 'Campo obrigatório: contact');
                if (!isNonEmptyString(email)) req.error(400, 'Campo obrigatório: email');
                return;
            }

            if ('name' in req.data && !isNonEmptyString(name)) req.error(400, 'Campo inválido: name');
            if ('contact' in req.data && !isNonEmptyString(contact)) req.error(400, 'Campo inválido: contact');
            if ('email' in req.data && !isNonEmptyString(email)) req.error(400, 'Campo inválido: email');
        });

        this.before(['CREATE', 'UPDATE'], Products, (req) => {
            const { name, description } = req.data || {};
            if (req.event === 'CREATE') {
                if (!isNonEmptyString(name)) req.error(400, 'Campo obrigatório: name');
                if (!isNonEmptyString(description)) req.error(400, 'Campo obrigatório: description');

                const rawPrice = req.data?.price;
                if (rawPrice === null || rawPrice === undefined || rawPrice === '') req.error(400, 'Campo obrigatório: price');
                const price = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(',', '.')) : Number(rawPrice);
                if (!Number.isFinite(price)) req.error(400, 'Campo inválido: price');
                req.data.price = price;

                const rawStock = req.data?.stock;
                if (rawStock === null || rawStock === undefined || rawStock === '') req.error(400, 'Campo obrigatório: stock');
                const stock = typeof rawStock === 'string' ? parseInt(rawStock, 10) : Number(rawStock);
                if (!Number.isFinite(stock)) req.error(400, 'Campo inválido: stock');
                req.data.stock = stock;
                return;
            }

            if ('name' in req.data && !isNonEmptyString(name)) req.error(400, 'Campo inválido: name');
            if ('description' in req.data && !isNonEmptyString(description)) req.error(400, 'Campo inválido: description');

            if ('price' in req.data) {
                const rawPrice = req.data?.price;
                if (rawPrice === null || rawPrice === undefined || rawPrice === '') req.error(400, 'Campo inválido: price');
                const price = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(',', '.')) : Number(rawPrice);
                if (!Number.isFinite(price)) req.error(400, 'Campo inválido: price');
                req.data.price = price;
            }

            if ('stock' in req.data) {
                const rawStock = req.data?.stock;
                if (rawStock === null || rawStock === undefined || rawStock === '') req.error(400, 'Campo inválido: stock');
                const stock = typeof rawStock === 'string' ? parseInt(rawStock, 10) : Number(rawStock);
                if (!Number.isFinite(stock)) req.error(400, 'Campo inválido: stock');
                req.data.stock = stock;
            }
        });

        await super.init();
    }
}

module.exports = CatalogService;

import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'

dotenv.config();

const { SPREADSHEET_ID, TRACKING_LINK } = process.env;

export const populateFillingSheet = async function (doc, data) {
    try {
        const workspaceSheet = doc.sheetsByTitle[process.env.FILLING_SHEET_NAME];
        let items = "";
        let itemsQuant = "";
        for (let i = 0; i < data.items.length; i++) {
            items += data.items[i].order;
            items += ' ~ ';
            itemsQuant += String(data.items[i].quantity);
            itemsQuant += ' ~ '
        }
        items = items.slice(0, -2);
        itemsQuant = itemsQuant.slice(0, -2)
        await workspaceSheet.addRow({
            Order_Number: data.order_id,
            Order: items,
            Order_Quantity: itemsQuant,
            Customer_Name: data.name,
            Customer_Phone: String(data.phone),
            Customer_Email: data.contact_email,
            Tracking_Number: '',
            Created_At: data.created_at,
            Tracking_Link: TRACKING_LINK
        })

    } catch (err) {
        throw err;
    }
}

export const getRawOrdersData = function (requestBody) {
    try {
        let contact_email;
        let phone;
        let order_id;
        const items = [];

        const { line_items, shipping_address, created_at } = requestBody;
        if (requestBody.customer.last_order_name)
            order_id = requestBody.customer.last_order_name.slice(1);
        else
            order_id = String(requestBody.id);

        if (requestBody.contact_email) contact_email = requestBody.contact_email;
        else contact_email = "Not Provided!"

        const name = shipping_address.name

        if (shipping_address.phone) phone = shipping_address.phone
        else phone = "Not Provided!";

        const dateArr = created_at.split('T')[0].split('-');
        const date = `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`;
        const time = created_at.split('T')[1];

        line_items.forEach(item => {
            items.push({ order: item.title, quantity: item.quantity })
        });

        return {
            order_id,
            name,
            items,
            contact_email,
            phone,
            created_at: `${date} : ${time}`
        }

    } catch (err) {
        throw err;
    }

}


export const googleSpreadsheetInit = async function () {
    try {
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        });
        await doc.loadInfo();
        return doc;
    } catch (err) {
        throw err;
    }
}

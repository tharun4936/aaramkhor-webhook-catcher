import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'

dotenv.config();

const { SPREADSHEET_ID, TRACKING_LINK } = process.env;

export const populateFillingSheet = async function (doc, data) {
    try {
        await doc.loadInfo();
        const workspaceSheet = doc.sheetsByTitle[process.env.FILLING_SHEET_NAME];
        const rows = await workspaceSheet.getRows();
        const noOfRows = rows.length;

        if (noOfRows > 0 && data.order_id <= rows[noOfRows - 1].Order_Number) throw new Error('Order Already Exists!');

        // let items = "";
        // let itemsQuant = "";
        for (let i = 0; i < data.items.length; i++) {

            await workspaceSheet.addRow({
                Order_Number: data.order_id,
                Order: data.items[i].order,
                Order_Quantity: data.items[i].quantity,
                Customer_Name: data.name,
                Customer_Phone: String(data.phone),
                Customer_Email: data.contact_email,
                Tracking_Number: '',
                Expected_Shipping_Date: '',
                Created_At: data.created_at,
                Tracking_Link: TRACKING_LINK,
                SKU_ID:data.items[i].sku_id,
                Design: data.items[i].design,
                Color: data.items[i].color,
                Size: data.items[i].size,
                Address: data.address,
                Pincode: data.pincode,
                Payment_Mode: data.items[i].payment_mode,
                Order_Value: data.items[i].order_value
            })
        }
        // items = items.slice(0, -2);
        // itemsQuant = itemsQuant.slice(0, -2)

    } catch (err) {
        throw err;
    }
}

export const getRawOrdersData = function (requestBody) {
    try {
        let contact_email;
        let phone;
        let order_id;
        let payment_mode;
        const items = [];

        const { line_items, shipping_address, created_at } = requestBody;
        const address = shipping_address.address1;
        const pincode = shipping_address.zip;

        if (requestBody.customer.last_order_name)
            order_id = requestBody.customer.last_order_name.slice(1);
        else
            order_id = String(requestBody.id);

        if (requestBody.contact_email) contact_email = requestBody.contact_email;
        else contact_email = "Not Provided!"

        const name = shipping_address.name;

        if (shipping_address.phone) phone = shipping_address.phone.replace(/ /g, '').slice(-10);
        else phone = "Not Provided!";

        const dateArr = created_at.split('T')[0].split('-');
        const date = `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`;
        const time = created_at.split('T')[1];

        line_items.forEach(item => {
            let size, design, color;
            const variant_title = item.variant_title.split('/').map(str => str.trim());
            const sku_id = item.sku;
            if(!item.sku){
                size = variant_title[0];
                color = variant_title[1];
                design  = 'Custom';
                payment_mode = requestBody.processing_method;
            }
            else{
                size = variant_title[1];
                color = variant_title[0];
                design = sku_id.split('_')[0].slice(-4);
                payment_mode = variant_title[2] || requestBody.payment_gateway_names[0];
            }
            const order_value = item.price;

            items.push({ order: item.title, quantity: item.quantity, color, size, sku_id, order_value, design, payment_mode})
        });
        const result = {
            order_id,
            address,
            name,
            items,
            pincode, 
            contact_email,
            phone,
            created_at: `${date} : ${time}`
        }
        console.log(result);
        return result;
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

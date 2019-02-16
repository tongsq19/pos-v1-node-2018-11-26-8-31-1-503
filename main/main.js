const main = require("../main/datbase.js");

/*
 * 函数说明：
 * printInventory() 根据 input 生成票据 Inventory 到控制台中。
 * 
 * 参数说明：
 * - database: 所有商品的列表，按照 barcode 索引。
 * - PromoteItems: 参与 "买二赠一” 的商品列表，按照 barcode 索引。
 * - Input: 输入的商品清单，(barcode，数量）排列。
 * 
 */

module.exports = function printInventory(inputs) {

    let database = GetDataBase();
    let PromoteItems = GetPromote();
    let Input = addItems(inputs);

    let total = 0;
    let PromoteInput = {};

    let Inventory = "***<没钱赚商店>购物清单***\n";

    for(let barcode in Input) {
        let name = database[barcode].name;
        let unit = database[barcode].unit;
        let price = database[barcode].price;
        let count = Input[barcode];

        if(barcode in PromoteItems) {
            let gift = Math.floor(count / 3);
            count = count - gift;
            PromoteInput[barcode] = {name: database[barcode].name, gift: gift, save: gift * price };
        }
        let sum_price  = price * count ;
        Inventory += "名称："+ name + "，数量："+ Input[barcode] + unit + "，单价：" + price.toFixed(2) + "(元)，小计：" + sum_price.toFixed(2) + "(元)\n";
        total += sum_price;
    }

    Inventory += "----------------------\n";

    let total_save = 0;
    
    if(Object.keys(PromoteInput).length > 0) {
        Inventory += "挥泪赠送商品：\n";
        for(let barcode in PromoteInput) {
            Inventory += "名称："+ database[barcode].name + "，数量："+ PromoteInput[barcode].gift + database[barcode].unit+'\n';
            total_save += PromoteInput[barcode].save;
        }
        Inventory += "----------------------\n";
    }
    Inventory +='总计：'+ total.toFixed(2) + '(元)\n' + '节省：' + total_save.toFixed(2) + '(元)\n' + '**********************';

    console.log(Inventory);
};

/*
 * 函数说明：
 * addItems() 统计输入的数组中，每个条形码 barcode 出现的次数。
 * 返回 {条形码 barcode => 次数 count} 的字典。
 */
function addItems(inputs) {
    let items = {};
    for(let i = 0; i < inputs.length; i++) {
        let result = inputs[i].split("-");
        if(result[0] === inputs[i]) {
            if(result[0] in items) {
                items[result[0]] += 1;
            } else {
                items[result[0]] = 1;
            }
        } else {
            if(result[0] in items) {
                items[result[0]] += result[1];
            } else {
                items[result[0]] = result[1];
            }
        }
    }
    return items
}

/*
 * 函数说明：
 * GetDataBase() 用于转换包含所有商品列表的数据格式。
 * 返回 {barcode => {商品名 name, 单位 unit, 单价 price}} 
 * 依赖外部函数 loadAllItems();
 */

function GetDataBase() {
    let AllItems = main.loadAllItems();
    let database = {};

    for(let i = 0; i < AllItems.length; i++) {
        database[AllItems[i].barcode] = {name : AllItems[i].name, unit : AllItems[i].unit, price : AllItems[i].price};
    }

    return database;
}

/*
 * 函数说明：
 * GetPromote() 返回商店中促销商品的列表。
 * 依赖外部函数 loadPromotions();
 */
function GetPromote() {
    let Promotions = main.loadPromotions();

    let PromoteItems = {};
    for(let i = 0; i< Promotions.length; i++) {
        if(Promotions[i].type === 'BUY_TWO_GET_ONE_FREE') {
            for(let j = 0; j < Promotions[i].barcodes.length; j++) {
                let id = Promotions[i].barcodes[j];
                PromoteItems[id] = {};
            }
        }
    }
    return PromoteItems;
}

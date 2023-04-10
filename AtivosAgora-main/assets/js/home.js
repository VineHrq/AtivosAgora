function number_format (number, decimals, dec_point, thousands_sep) {
    if(number < 0.01){
      decimals = 8;
    }
    // Strip all characters but numerical ones.
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

localStorage.setItem("selectOptions", "");
localStorage.setItem("controlSelect", "0");

if (localStorage.getItem("favoritos_ativo") === null) {
    localStorage.setItem("favoritos_ativo", "0");
}


var initial;
function showTopFive(tipo) {
    clearTimeout( initial )    

    let url;
    if(tipo == 'crypto'){
    url = 'https://api.ativosagora.com.br/api/v1/crypto';
    }else{
    url = 'https://api.ativosagora.com.br/api/v1/finance';
    }

    if(tipo == 'crypto'){
    initial = setTimeout(() => {
        showTopFive('crypto');
    }, 6000);

    fetch('https://api.ativosagora.com.br/api/v1/crypto', {
        method: "GET",
    })
    .then(function (response) {
        response.json().then(function (res) {
        showData(tipo, '', res);
        });
    })
    .catch(function (err) {
        console.error(err);
    });
    }

    if(tipo != 'crypto'){
    fetch('https://api.ativosagora.com.br/api/v1/finance', {
        method: "GET",
    })
    .then(function (response) {
        response.json().then(function (res) {
        showData(tipo, res, '');
        });
    })
    .catch(function (err) {
        console.error(err);
    });
    }
}

function showData(tipo, res, res_crypto) {
    var loop = [];
    let arrayMain = [];
    var selects = [];
    let dadosJson = '{ "ASSETS": [';

    var favoritos_ativo = localStorage.getItem("favoritos_ativo").split(",");

    var ids = res.data;
    var ids_crypto = res_crypto.data;

    if(res != ''){
    ids.forEach((id, index) => {
        let arrayDados = [];
        
        if (id.type == tipo || (tipo == "favoritos" && favoritos_ativo.includes(id.asset))) {
        if (id.name == 0) {
            var option = id.asset;
        } else {
            var option = id.name;
        }
        selects.push([option, id.asset]);
        if (
            localStorage.getItem("selectOptions").includes(id.asset) ||
            localStorage.getItem("selectOptions") == ""
        ) {
            if (!loop.includes(id.sector)) {
            loop.push(id.sector);
            }

            let volume = id.volume;

            if (tipo == "favoritos" && favoritos_ativo.includes(id.asset)) {
            volume = 99999999;
            }

            arrayDados.push({
            idsector: id.idsector,
            sector: id.sector,
            name: id.asset,
            price: id.price,
            pc: id.variation
            });
            arrayMain.push(arrayDados);
        }
        }
    });
    }

    if(res_crypto != ''){
    ids_crypto.forEach((id, index) => {
        if(id.symbol.includes('USDT', 1)){
        if ('crypto' == tipo || (tipo == "favoritos" && favoritos_ativo.includes(id.symbol.replace('USDT', '/USD')))) {
            selects.push([id.symbol.replace('USDT', ''), id.symbol.replace('USDT', '/USD')]);
    
            if (
            localStorage.getItem("selectOptions").includes(id.symbol.replace('USDT', '/USD')) ||
            localStorage.getItem("selectOptions") == ""
            ) {
            if (!loop.includes('Criptomoedas')) {
                loop.push('Criptomoedas');
            }
    
            let arrayDados = [];
            if(id.lastPrice > 0){
                arrayDados.push({
                idsector: 27,
                sector: 'Criptomoedas',
                name: id.symbol.replace('USDT', '/USD'),
                price: '$'+number_format(id.lastPrice, 2, '.', '.'),
                pc: (id.priceChangePercent/100)
                });
                arrayMain.push(arrayDados);
            }
            }
        }
        }
    });
    }

    
    for (var y = 0; y < loop.length; y++) {
    var contador = 0;
    for (var x = 0; x < arrayMain.length; x++) {
        var z = parseInt(x) + parseInt(1);
        if (loop[y] == arrayMain[x][0].sector) {
        if(loop[y] == 'Criptomoedas'){
            if (contador == 0) {
            dadosJson +=
                '{"name" :"' +
                arrayMain[x][0].name +
                '","price" :"' +
                arrayMain[x][0].price +
                '","pc" :"' +
                arrayMain[x][0].pc +
                '"}';
            } else {
            dadosJson +=  
                ', {"name" :"' +
                arrayMain[x][0].name +
                '","price" :"' +
                arrayMain[x][0].price +
                '","pc" :"' +
                arrayMain[x][0].pc +
                '"}';
            }
        }else{
            if (contador == 0) {
            dadosJson +=
                '{"name" :"' +
                arrayMain[x][0].name +
                '","price" :"' +
                arrayMain[x][0].price +
                '","pc" :"' +
                arrayMain[x][0].pc
                .replace(/\./g, "")
                .replace(/\,/g, ".") +
                '"}';
            } else {
            dadosJson +=
                ', {"name" :"' +
                arrayMain[x][0].name +
                '","price" :"' +
                arrayMain[x][0].price +
                '","pc" :"' +
                arrayMain[x][0].pc
                .replace(/\./g, "")
                .replace(/\,/g, ".") +
                '"}';
            }
        }
        if (arrayMain[z] != undefined) {
            if (loop[y] != arrayMain[z][0].sector) {
            dadosJson += ", ";
            }
        } else {
            dadosJson += "";
        }
        contador++;
        }
    }
    }

    dadosJson += "]}";

    let data = JSON.parse(dadosJson);

    let sortedInput = data['ASSETS'].slice().sort((a, b) => b.pc - a.pc);
    
    let dataMax = sortedInput.slice(0, 5);

    let dataMin = sortedInput.slice(Math.max(sortedInput.length - 5, 0));

    let div = '<div class="assets">';

    dataMax.forEach((data, index) => {
        let variation;

        if(data.pc < 0){
            variation = `<div class="var_down variation">${(data.pc * 100).toFixed(2).replace(".", ",")}%</div>`;
        }else{
            variation = `<div class="var_up variation">+${(data.pc * 100).toFixed(2).replace(".", ",")}%</div>`;
        }

        if(index == 0){
            div += '<div class="line first_Line">';
        }else{
            div += '<div class="line">';
        }

        div += `<div class="asset">${data.name}</div>
            <div class="price">${data.price}</div>
            ${variation}
        </div>`;

        // console.log(data.name, data.price, variation)
    })

    console.log('')
    console.log('')


    dataMin.forEach((data, index) => {
        let variation;

        if(data.pc < 0){
            variation = `<div class="var_down variation">${(data.pc * 100).toFixed(2).replace(".", ",")}%</div>`;
        }else{
            variation = `<div class="var_up variation">+${(data.pc * 100).toFixed(2).replace(".", ",")}%</div>`;
        }

        if(index == 0){
            div += '<div class="line first_down">';
        }else{
            div += '<div class="line">';
        }

        div += `<div class="asset">${data.name}</div>
            <div class="price">${data.price}</div>
            ${variation}
        </div>`;

        // console.log(data.name, data.price, variation)
    })

    div += '</div>';

    console.log(`#${tipo}`);

    $(`#${tipo}`).html(div);
}
  
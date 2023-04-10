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

function setSelect(tipo) {
  localStorage.setItem("selectOptions", $("#select").val());
  showTreemap(tipo);
}
var initial;
function showTreemap(tipo) {


  clearTimeout( initial )    

  let url;
  if(tipo == 'crypto'){
    url = 'https://api.ativosagora.com.br/api/v1/crypto';
  }else{
    url = 'https://api.ativosagora.com.br/api/v1/finance';
  }

  if(tipo == 'crypto'){
    initial = setTimeout(() => {
      showTreemap('crypto');
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

  if(tipo != "favoritos" && tipo != 'crypto'){
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

  if(tipo == 'favoritos'){
    fetch('https://api.ativosagora.com.br/api/v1/finance', {
      method: "GET",
    })
    .then(function (response) {
      response.json().then(function (res) {
  
        fetch('https://api.ativosagora.com.br/api/v1/crypto', {
          method: "GET",
        })
        .then(function (response1) {
          response1.json().then(function (res_crypto) {
            showData(tipo, res, res_crypto);
          });
        })
        .catch(function (err) {
          console.error(err);
        });
      });
    })
    .catch(function (err) {
      console.error(err);
    });
  }
}

function getColor(variation) {
  variation = parseFloat(variation);

  if (variation >= 0.05) {
    return "#215E2D";
  } else if (variation > 0) {
    return "#518652";
  } else if (variation <= -0.05) {
    return "#AA2122";
  } else if (variation == 0) {
    return "#878787";
  } else {
    return "#C84041";
  }
}

if (localStorage.getItem("favoritos_ativo") === null) {
  localStorage.setItem("favoritos_ativo", "0");
}

var favoritos_ativo = localStorage.getItem("favoritos_ativo").split(",");

localStorage.setItem("selectOptions", "");
localStorage.setItem("controlSelect", "0");

function showData(tipo, res, res_crypto) {
  var loop = [];
  let arrayMain = [];
  var selects = [];
  let dadosJson = '{ "name": "ASSETS", "children": [';

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
            pc: id.variation,
            volume: volume,
            type: id.type,
            name_asset: id.name,
            max: id.max,
            min: id.min,
            update: id.update,
            research: id.research,
            pvpa: id.pvpa,
            yield: id.yield,
            dividendo: id.dividendo,
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
                price: '$'+number_format(id.lastPrice, 2, '.', ','),
                pc: (id.priceChangePercent/100),
                volume: id.quoteVolume,
                type: 'crypto',
                name_asset: id.symbol.replace('USDT', ''),
                max: '$'+number_format(id.highPrice, 2, ',', '.'),
                min: '$'+number_format(id.lowPrice, 2, ',', '.'),
                update: '',
                research: id.symbol,
                pvpa: '',
                yield: '',
                dividendo: '',
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

        if(arrayMain[x][0].price.includes("R$")){
          var preco = arrayMain[x][0].price;
          var max = arrayMain[x][0].max;
          var min = arrayMain[x][0].min;
        }else{
          var preco = arrayMain[x][0].price.replace(/\./g, "=").replace(/\,/g, ".").replace(/\=/g, ",");
          var max = arrayMain[x][0].max.replace(/\./g, "=").replace(/\,/g, ".").replace(/\=/g, ",");
          var min = arrayMain[x][0].min.replace(/\./g, "=").replace(/\,/g, ".").replace(/\=/g, ",");
        }

        if(loop[y] == 'Criptomoedas'){
          if (contador == 0) {
            dadosJson +=
              '{"name": "' +
              loop[y] +
              '", "children" :[{"name" :"' +
              arrayMain[x][0].name +
              '","price" :"' +
              arrayMain[x][0].price +
              '","pc" :"' +
              arrayMain[x][0].pc +
              '", "volume": "' +
              arrayMain[x][0].volume +
              '", "idsector": ' +
              arrayMain[x][0].idsector +
              ', "type": "' +
              arrayMain[x][0].type +
              '", "name_asset": "' +
              arrayMain[x][0].name_asset +
              '", "max": "' +
              arrayMain[x][0].max +
              '", "min": "' +
              arrayMain[x][0].min +
              '", "update": "' +
              arrayMain[x][0].update +
              '", "research": "' +
              arrayMain[x][0].research +
              '", "sector": "' +
              arrayMain[x][0].sector +
              '", "pvpa": "' +
              arrayMain[x][0].pvpa +
              '", "yield": "' +
              arrayMain[x][0].yield +
              '", "dividendo": "' +
              arrayMain[x][0].dividendo +
              '"}';
          } else {
            dadosJson +=  
              ', {"name" :"' +
              arrayMain[x][0].name +
              '","price" :"' +
              arrayMain[x][0].price +
              '","pc" :"' +
              arrayMain[x][0].pc +
              '", "volume": "' +
              arrayMain[x][0].volume +
              '", "idsector": ' +
              arrayMain[x][0].idsector +
              ', "type": "' +
              arrayMain[x][0].type +
              '", "name_asset": "' +
              arrayMain[x][0].name_asset +
              '", "max": "' +
              arrayMain[x][0].max +
              '", "min": "' +
              arrayMain[x][0].min +
              '", "update": "' +
              arrayMain[x][0].update +
              '", "research": "' +
              arrayMain[x][0].research +
              '", "sector": "' +
              arrayMain[x][0].sector +
              '", "pvpa": "' +
              arrayMain[x][0].pvpa +
              '", "yield": "' +
              arrayMain[x][0].yield +
              '", "dividendo": "' +
              arrayMain[x][0].dividendo +
              '"}';
          }
        }else{
          if (contador == 0) {
            dadosJson +=
              '{"name": "' +
              loop[y] +
              '", "children" :[{"name" :"' +
              arrayMain[x][0].name +
              '","price" :"' +
              preco +
              '","pc" :"' +
              arrayMain[x][0].pc
                .replace(/\./g, "")
                .replace(/\,/g, ".") +
              '", "volume": "' +
              arrayMain[x][0].volume +
              '", "idsector": ' +
              arrayMain[x][0].idsector +
              ', "type": "' +
              arrayMain[x][0].type +
              '", "name_asset": "' +
              arrayMain[x][0].name_asset +
              '", "max": "' +
              max +
              '", "min": "' +
              min +
              '", "update": "' +
              arrayMain[x][0].update +
              '", "research": "' +
              arrayMain[x][0].research +
              '", "sector": "' +
              arrayMain[x][0].sector +
              '", "pvpa": "' +
              arrayMain[x][0].pvpa +
              '", "yield": "' +
              arrayMain[x][0].yield +
              '", "dividendo": "' +
              arrayMain[x][0].dividendo +
              '"}';
          } else {
            dadosJson +=
              ', {"name" :"' +
              arrayMain[x][0].name +
              '","price" :"' +
              preco +
              '","pc" :"' +
              arrayMain[x][0].pc
                .replace(/\./g, "")
                .replace(/\,/g, ".") +
              '", "volume": "' +
              arrayMain[x][0].volume +
              '", "idsector": ' +
              arrayMain[x][0].idsector +
              ', "type": "' +
              arrayMain[x][0].type +
              '", "name_asset": "' +
              arrayMain[x][0].name_asset +
              '", "max": "' +
              max +
              '", "min": "' +
              min +
              '", "update": "' +
              arrayMain[x][0].update +
              '", "research": "' +
              arrayMain[x][0].research +
              '", "sector": "' +
              arrayMain[x][0].sector +
              '", "pvpa": "' +
              arrayMain[x][0].pvpa +
              '", "yield": "' +
              arrayMain[x][0].yield +
              '", "dividendo": "' +
              arrayMain[x][0].dividendo +
              '"}';
          }
        }
        if (arrayMain[z] != undefined) {
          if (loop[y] != arrayMain[z][0].sector) {
            dadosJson += "]}, ";
          }
        } else {
          dadosJson += "]}";
        }
        contador++;
      }
    }
  }


  dadosJson += "]}";

  let data = JSON.parse(dadosJson);

  let chartDiv = document.getElementById("chart");
  let svg = d3.select(chartDiv).append("svg");

  let format = d3.format(",d");

  let colors = [
    "#AA2121",
    "#C84040",
    "#ED7171",
    "#7EC17E",
    "#518651",
    "#215E2C",
    "#878787",
  ];

  var tooltip = d3.select("#chart").append("div");

  function redraw() {
    var width = chartDiv.clientWidth;
    var height = chartDiv.clientHeight;
    var color = "";

    d3.select("svg").html("");

    let chart = () => {
      const root = treemap(filteredData);

      const svg = d3.select("svg");

      svg.attr("width", "100%")
        .attr("height", "100%")
        .attr("style", "margin-top: -20px")
        .classed("svg-content-responsive", true);

      const leaf = svg
        .selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
        .text(function (d) {
          d.data.price2 = d.data.price.replace(
            /(\d)(?=(\d{3})+\,)/g,
            "$1."
          );
        })
        .text(
          (d) =>
          (d.data.pc2 =
            d.data.pc > 0
              ? `+${(d.data.pc * 100)
                .toFixed(2)
                .replace(".", ",")}%`
              : `${(d.data.pc * 100)
                .toFixed(2)
                .replace(".", ",")}%`)
        )
        .on("dblclick", function (d) {
          if (d.data.pc > 0) {
            color = "dc_color_p";
          } else if (d.data.pc == 0) {
            color = "dc_color_e";
          } else {
            color = "dc_color_m";
          }
          if (d.data.update != 0) {
            var text = "Atualizado em " + d.data.update;
          } else {
            var text = "Atualizado recentemente";
          }

          let titulo = d.data.idsector == "14" ? "Pontos" : "Preço";

          let max = d.data.max.length <= "2" ? "-" : d.data.max;
          let min = d.data.min.length <= "2" ? "-" : d.data.min;

          if (d.data.type == "fii") {
            // Modal de fundos imobiliarios
            $("#modals").html(`
            <div class="modal modal-details fade show" id="modalDetalhes" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" style="display: block; padding-right: 15px;" aria-modal="true">
                <div class="modal-backdrop fade show"></div>
                <div class="modal-dialog" role="document">
                    <div class="modal-content modal-content-w">
                        <input type="hidden" value="${tipo}" id="tipo">
                        <div class="modal-header">
                          <div class="starFav">
                            <div id="fav" class="tooltip-right" tooltip-text="Adicionar aos favoritos"><i onclick="fav('${d.data.name}')" class="far fa-star"></i></div>
                            <div id="disfav" style='display:none' class="tooltip-right" tooltip-text="Remover dos favoritos"><i onclick="disfav('${d.data.name}', '${tipo}')" class="fas fa-star"></i></div>
                          </div>
                            <h5 class="modal-title modal-details-title" id="ModalLabel">${d.data.name}</h5>
                        </div>
                        <button type="button" class="btn btn-close btn-outline-secondary btn-rounded btn-icon" onclick="closeModal('${tipo}')"></button>
                        <div class="modal-body modal-details-body">
                          <div class="details-content">
                            <h5 class="dc_name">${d.data.research}</h5>
                            <span class="dc_sector">${d.data.sector}</span>
                            <div class="dc_prices dc_bdr_top">
                              <div class="dc_box">
                                <span class="dc_box_title">Mínima</span>
                                <span class="dc_box_value">${min}</span>
                              </div>
                              <div class="dc_border"></div>
                              <div class="dc_box dc_padd">
                                <span class="dc_box_title">${titulo}</span>
                                <span class="dc_box_value dc_value_price">${d.data.price2}</span>
                                <span class="dc_box_var ${color}">${d.data.pc2}</span>
                              </div>
                              <div class="dc_border"></div>
                              <div class="dc_box">
                                <span class="dc_box_title">Máxima</span>
                                <span class="dc_box_value">${max}</span>
                              </div>
                            </div>
                            <div class="dc_border_h"></div>
                            <div class="dc_prices dc_bdr_bottom">
                              <div class="dc_box">
                                <span class="dc_box_title">P/VPA</span>
                                <span class="dc_box_value">${d.data.pvpa}</span>
                              </div>
                              <div class="dc_border"></div>
                              <div class="dc_box">
                                <span class="dc_box_title">Último rendimento</span>
                                <span class="dc_box_value dc_value_price">${d.data.dividendo}</span>
                              </div>
                              <div class="dc_border"></div>
                              <div class="dc_box">
                                <span class="dc_box_title">Yield/mês</span>
                                <span class="dc_box_value">${d.data.yield}</span>
                              </div>
                            </div>
                          </div>
                            <li class='modal-att'>${text}</li>
                        </div>
                    </div>
                </div>
            </div>
            <script>
              function closeModal(tipo){
                $('#modalDetalhes').remove();
                if(tipo == "favoritos"){
                  showTreemap(tipo);
                }
              }
            </script>
          `);
          } else {
            // Modal de ações e cripto
            $("#modals").html(`
              <div class="modal modal-details fade show" id="modalDetalhes" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" style="display: block; padding-right: 15px;" aria-modal="true">
                  <div class="modal-backdrop fade show"></div>
                  <div class="modal-dialog" role="document">
                      <div class="modal-content modal-content-w">
                          <input type="hidden" value="${tipo}" id="tipo">
                          <div class="modal-header">
                            <div class="starFav">
                              <div id="fav" class="tooltip-right" tooltip-text="Adicionar aos favoritos"><i onclick="fav('${d.data.name}')" class="far fa-star"></i></div>
                              <div id="disfav" style='display:none' class="tooltip-right" tooltip-text="Remover dos favoritos"><i onclick="disfav('${d.data.name}', '${tipo}')" class="fas fa-star"></i></div>
                            </div>
                              <h5 class="modal-title modal-details-title" id="ModalLabel">${d.data.name}</h5>
                          </div>
                          <button type="button" class="btn btn-close btn-outline-secondary btn-rounded btn-icon" onclick="closeModal('${tipo}')"></button>
                          <div class="modal-body modal-details-body">
                          <div class="details-content">
                            <h5 class="dc_name">${d.data.research}</h5>
                            <span class="dc_sector">${d.data.sector}</span>
                            <div class="dc_prices dc_bdr_top">
                              <div class="dc_box">
                                <span class="dc_box_title">Mínima</span>
                                <span class="dc_box_value">${min}</span>
                              </div>
                              <div class="dc_border"></div>
                              <div class="dc_box dc_padd">
                                <span class="dc_box_title">${titulo}</span>
                                <span class="dc_box_value dc_value_price">${d.data.price2}</span>
                                <span class="dc_box_var ${color}">${d.data.pc2}</span>
                              </div>
                              <div class="dc_border"></div>
                              <div class="dc_box">
                                <span class="dc_box_title">Máxima</span>
                                <span class="dc_box_value">${max}</span>
                              </div>
                            </div>
                          </div>
                            <li class='modal-att'>${text}</li>
                        </div>
                      </div>
                  </div>
              </div>
              <script>
                function closeModal(tipo){
                  $('#modalDetalhes').remove();
                  if(tipo == "favoritos"){
                    showTreemap(tipo);
                  }
                }
              </script>
            `);
          }

          var fav_ativo = localStorage
            .getItem("favoritos_ativo")
            .split(",");

          if (fav_ativo.includes(d.data.name)) {
            document.getElementById("fav").style.display = "none";
            document.getElementById("disfav").style.display =
              "block";
          } else {
            document.getElementById("fav").style.display = "block";
            document.getElementById("disfav").style.display =
              "none";
          }
        });

      leaf.append("rect")
        .attr("id", (d) => (d.leafUid = "#leaf").id)
        .attr("fill", (d) => getColor(d.data.pc))
        .attr("fill-opacity", 1.0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .attr("class", (d) => "node level-" + d.depth);

      let txt = leaf
        .append("text")
        .attr("fill", "#fff")
        .attr("text-anchor", "middle")
        .attr("class", "shadow")
        // .attr("dy", "1.7em")
        .attr("y", function () {
          const parentData = d3.select(this.parentNode).datum();
          return (parentData.y1 - parentData.y0) / 2;
        })
        // .attr("x", "1.7em")
        // .attr("unicode-bidi","isolate-override")
        .attr(
          "font-size",
          (d) => Math.min(d.x1 - d.x0, d.y1 - d.y0) / 7
        );

      // Add a <tspan class="title"> for every data element.
      txt.append("tspan")
        .html(function (d) {
          if (
            d.data.name_asset != "0" &&
            d.data.name_asset.replace(/[^a-zA-Zs]/g, "") != ""
          ) {
            return d.data.name_asset;
          } else {
            return d.data.name;
          }
        })
        .attr("class", "title")
        .attr("dy", "-1em")
        .attr("stroke-width", "50%")
        .attr("font-size", function (d) {
          if (d.data.name_asset == "DOW JONES") {
            return Math.min(d.x1 - d.x0, d.y1 - d.y0) / 6;
          } else {
            return Math.min(d.x1 - d.x0, d.y1 - d.y0) / 5;
          }
        })
        .attr("x", function () {
          const parentData = d3.select(this.parentNode).datum();
          return (parentData.x1 - parentData.x0) / 2;
        });

      txt.append("tspan")
        .text(function (d) {
          return d.data.price.replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
        })
        .attr("class", "price")
        .attr("dy", "1.8em")
        .attr("x", function () {
          const parentData = d3.select(this.parentNode).datum();
          return (parentData.x1 - parentData.x0) / 2;
        });

      // Add a <tspan class="author"> for every data element.
      // Add a <tspan class="author"> for every data element.
      txt.append("tspan")
        .text((d) =>
          d.data.pc > 0
            ? `+${(d.data.pc * 100).toFixed(2).replace(".", ",")}%`
            : `${(d.data.pc * 100).toFixed(2).replace(".", ",")}%`
        )
        .attr("class", "percent")
        .attr("dy", "1.8em")
        .attr("x", function () {
          const parentData = d3.select(this.parentNode).datum();
          return (parentData.x1 - parentData.x0) / 2;
        });

      // Add title for the top level
      svg.selectAll("titles")
        .data(
          root.descendants().filter(function (d) {
            return d.depth == 1;
          })
        )
        .enter()
        .append("g")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("dx", (d) => d.x0 + d.x1)
        .attr("dy", (d) => d.y0 + d.y1)
        .append("text")
        .attr("x", (d) => d.x0 + 4)
        .attr("y", (d) => d.y0 + 25)
        .text((d) => d.data.name)
        .attr("font-size", function (d) {
          if (Math.min(d.x1 - d.x0, d.y1 - d.y0) / 20 > 15) {
            return 14;
          } else if (Math.min(d.x1 - d.x0, d.y1 - d.y0) / 20 < 6) {
            return 8;
          } else {
            return Math.min(d.x1 - d.x0, d.y1 - d.y0) / 18;
          }
        })
        .attr("fill", "#fff");

      return svg.node();
    };

    let filteredData = d3
      .hierarchy(data)
      .sum(function (d) {
        function getRandomArbitrary(min, max) {
          return Math.random() * (max - min) + min;
        }
        if (tipo == "favoritos") {
          return 9999999; 
        }
        if (d.type == "outros") {
          if (d.volume < 9999999) {
            return d.volume;
          } else {
            return d.volume;
          }
        } else if (d.type == "fii") {
          if (d.volume < 10000) {
            return getRandomArbitrary(40000, 75000);
          } else {
            return d.volume;
          }
        } else if (d.type == "crypto") {
          if (d.volume < 5239200) {
            return 2239200;
          }else if (d.research == 'BTCUSDT') {
            return d.volume*2;
          }else{
            return d.volume;
          }
        } else if (d.type == "etf_br") {
          if (d.volume < 1500000) {
            return getRandomArbitrary(500000, 1500000);
          } else {
            return d.volume;
          }
        } else {
          if (d.idsector == 7) {
            return 8500000;
          }
          if (d.volume < 1000000) {
            return getRandomArbitrary(3000000, 6000000);
          } else if (d.volume > 1000000 && d.volume < 5000000) {
            return getRandomArbitrary(6000000, 1000000);
          } else {
            return d.volume;
          }
        }
      })
      .sort((a, b) => b.height - a.height || b.value - a.value);

    let reg = d3.selectAll("input[name='dtype']").on("change", function () {
      let dtype = this.value;
    });

    let treemap = d3
      .treemap()
      .size([width, height])
      .padding(1)
      .paddingRight(3)
      .paddingLeft(3)
      .paddingBottom(0)
      .paddingTop(30)
      .round(true);

    // let charsts = d3.select("#chart");

    let format = d3.format(",d");

    if (tipo == sessionStorage.getItem("view")) {
      chart();
      $(".loading").remove();
      $("#menunav").show();
      $("#tips").show();

      if (localStorage.getItem("controlSelect") == 0) {
        for (var z = 0; z < selects.length; z++) {
          if (
            localStorage
              .getItem("selectOptions")
              .includes(selects[z])
          ) {
            $("#select").append(
              `<option value="${selects[z][1]}" selected>${selects[z][0]}</option>`
            );
          } else {
            $("#select").append(
              `<option value="${selects[z][1]}">${selects[z][0]}</option>`
            );
          }
        }
      }
      localStorage.setItem("controlSelect", "1");
    }
  }

  redraw();

  window.addEventListener("resize", redraw);
}

function fav(ativo) {
  favoritos_ativo.push(ativo);
  localStorage.setItem("favoritos_ativo", favoritos_ativo);

  document.getElementById("fav").style.display = "none";
  document.getElementById("disfav").style.display = "block";

  notif({
    msg: "Adicionado aos favoritos com sucesso!",
    type: "success",
    bgcolor: "#00B55E",
    color: "#FFF",
  });
}

function disfav(ativo, tipo) {
  favoritos_ativo = favoritos_ativo.filter((item) => item !== ativo);
  localStorage.setItem("favoritos_ativo", favoritos_ativo);

  document.getElementById("fav").style.display = "block";
  document.getElementById("disfav").style.display = "none";

  notif({
    msg: "Removido dos favoritos com sucesso!",
    type: "success",
    bgcolor: "#00B55E",
    color: "#FFF",
  });

  if(tipo == 'favoritos'){
    closeModal($("#tipo").val());

    if (localStorage.getItem("favoritos_ativo") === null || localStorage.getItem("favoritos_ativo") == 0) {
            
      sessionStorage.setItem("view", "favoritos");
  
      document.getElementById("select").style.display = "none";
      document.getElementById("empty").style.display = "block";
  
      $('.nav-link').removeClass(`active`);
      $('#favoritos').addClass(`active`);
  
      localStorage.setItem("selectOptions", "");
      localStorage.setItem("controlSelect", 0);
  
      $('#select option:enabled').remove();
  
      $(".loading").remove();
      $("#menunav").show();
    }
  }
}

window.addEventListener("keydown", function (e) {
  if (e.keyCode === 27) {
    if ($("#tipo").length > 0) {
      closeModal($("#tipo").val());
    }
  }
});

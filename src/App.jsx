import { useState, useEffect, useCallback } from "react";

// ===========================================================
// SUPABASE CONFIG  -  substitua pela sua URL e chave anon
// ===========================================================
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

const sb = {
  headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
  url: (path) => `${SUPABASE_URL}/rest/v1/${path}`,
  auth: (path) => `${SUPABASE_URL}/auth/v1/${path}`,

  async get(table, query = "") {
    const r = await fetch(this.url(`${table}?${query}`), { headers: this.headers });
    return r.json();
  },
  async post(table, body) {
    const r = await fetch(this.url(table), { method: "POST", headers: this.headers, body: JSON.stringify(body) });
    return r.json();
  },
  async patch(table, id, body) {
    const r = await fetch(this.url(`${table}?id=eq.${id}`), { method: "PATCH", headers: this.headers, body: JSON.stringify(body) });
    return r.json();
  },
  async delete(table, id) {
    const r = await fetch(this.url(`${table}?id=eq.${id}`), { method: "DELETE", headers: this.headers });
    return r.ok;
  },
  async login(email, password) {
    const r = await fetch(this.auth("token?grant_type=password"), { method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY }, body: JSON.stringify({ email, password }) });
    return r.json();
  },
};

// ===========================================================
// TIPOS DE EQUIPAMENTO E CHECKLISTS PADRÃO
// ===========================================================

// ===========================================================
// CHECKLISTS  -  PEDREIRA TESTE 01
// ===========================================================

// t: "c"=check simples, "q"=check+qtd, "op"=check+opcoes, "v"=check+valor numerico
const TC_GRUPOS = [
  {grupo:"Correia",itens:[
    {id:"tc1",label:"Troca de correia",t:"c"},
    {id:"tc2",label:"Emenda de correia",t:"c"},
    {id:"tc3",label:"Alinhamento de correia",t:"c"},
    {id:"tc4",label:"Tensionamento de correia",t:"c"},
  ]},
  {grupo:"Roletes",itens:[
    {id:"rc",label:"Troca de roletes de carga",t:"q"},
    {id:"rr",label:"Troca de roletes de retorno",t:"q"},
    {id:"ri",label:"Troca de roletes de impacto",t:"q"},
    {id:"rg",label:"Troca de rolete de guia",t:"q"},
  ]},
  {grupo:"Mesa de Impacto",itens:[
    {id:"mi1",label:"Solda na mesa de impacto",t:"c"},
    {id:"mi2",label:"Troca das barras de borracha",t:"q"},
  ]},
  {grupo:"Cavaletes",itens:[
    {id:"cc",label:"Troca de cavalete de carga",t:"q"},
    {id:"cr",label:"Troca de cavalete de retorno",t:"q"},
  ]},
  {grupo:"Tambores",itens:[
    {id:"tt",label:"Troca de tambor de tracao",t:"c"},
    {id:"tp",label:"Troca de tambor do pe (retorno)",t:"c"},
    {id:"me",label:"Troca de mancal - lado E",t:"c"},
    {id:"md",label:"Troca de mancal - lado D",t:"c"},
  ]},
  {grupo:"Rolamentos",itens:[
    {id:"rot",label:"Troca de rolamento - Tambor de tracao",t:"c"},
    {id:"rop",label:"Troca de rolamento - Tambor do pe (retorno)",t:"c"},
  ]},
  {grupo:"Redutora",itens:[
    {id:"red1",label:"Troca",t:"c"},
    {id:"red2",label:"Alinhamento  -  polia",t:"c"},
    {id:"red3",label:"Alinhamento  -  correia",t:"c"},
    {id:"red4",label:"Manutencao",t:"c"},
  ]},
  {grupo:"Motor",itens:[
    {id:"mot1",label:"Troca",t:"c"},
    {id:"mot2",label:"Manutencao",t:"c"},
    {id:"mot3",label:"Alinhamento  -  polia",t:"c"},
  ]},
  {grupo:"Limpeza",itens:[
    {id:"lr",label:"Regulagem de raspador",t:"c"},
    {id:"ll",label:"Troca de raspador (lamina)",t:"c"},
    {id:"lc",label:"Troca de chute / saia",t:"c"},
  ]},
  {grupo:"Lubrificacao",itens:[
    {id:"lo",label:"Lubrificacao de rolamentos",t:"c"},
    {id:"lm",label:"Lubrificacao de mancais",t:"c"},
    {id:"lg",label:"Lubrificacao geral",t:"c"},
  ]},
  {grupo:"Estrutura",itens:[
    {id:"es",label:"Solda em geral",t:"c"},
    {id:"er",label:"Reparo estrutural",t:"c"},
    {id:"ev",label:"Verificacao estrutural",t:"c"},
    {id:"ei",label:"Inspecao geral",t:"c"},
  ]},
];

const PEN_CONFIG = {
  PEN01:{nome:"TDA",material:"Material bruto / ROM",decks:[
    {id:"tda_d1",label:"Deck Superior",info:"Borracha 110mm"},
    {id:"tda_d2",label:"Deck Inferior",info:"Borracha 22mm"},
  ]},
  PEN02:{nome:"EMIC",material:"Brita 1, 2, 3 / Pedrisco / Po de pedra",decks:[
    {id:"emic_d1",label:"Deck Superior",info:"Borracha 75mm"},
    {id:"emic_d2",label:"Deck Inferior",info:"Borracha 22mm"},
  ]},
  PEN03:{nome:"METSO",material:"Brita 1, 2, 3 / Pedrisco / Po de pedra",decks:[
    {id:"metso_d1",label:"Deck 1 (Superior)",info:"Aco 19mm"},
    {id:"metso_d2",label:"Deck 2",info:"Borracha 12mm"},
    {id:"metso_d3",label:"Deck 3",info:"Borracha 5mm"},
  ]},
  PEN04:{nome:"REMASO",material:"Po de pedra / Pedrisco / Brita 2",decks:[
    {id:"remaso_d1",label:"Deck 1 (Superior)",info:"Borracha 22mm"},
    {id:"remaso_d2",label:"Deck 2",info:"Borracha 12mm"},
    {id:"remaso_d3",label:"Deck 3",info:"Borracha 5mm"},
  ]},
};

const PEN_GRUPOS_FIXOS = [
  {grupo:"Rolamentos",itens:[
    {id:"pr_me",label:"Mancal lado E",t:"c"},
    {id:"pr_md",label:"Mancal lado D",t:"c"},
    {id:"pr_ev",label:"Eixo vibratorio",t:"c"},
    {id:"pr_mo",label:"Motor",t:"c"},
  ]},
  {grupo:"Cardam",itens:[
    {id:"pc_ca",label:"Cardam",t:"op",ops:["Troca total","Troca parcial","Reaperto","Manutencao"]},
  ]},
  {grupo:"Lubrificacao",itens:[
    {id:"pl_ro",label:"Lubrificacao de rolamentos",t:"c"},
    {id:"pl_ma",label:"Lubrificacao de mancais",t:"c"},
    {id:"pl_ge",label:"Lubrificacao geral",t:"c"},
  ]},
  {grupo:"Estrutura",itens:[
    {id:"pe_so",label:"Solda em geral",t:"c"},
    {id:"pe_re",label:"Reparo estrutural",t:"c"},
    {id:"pe_vi",label:"Verificacao estrutural",t:"c"},
  ]},
];

const BRT_GRUPOS = {
  HP400:[
    {grupo:"Manto / Revestimento Concavo",itens:[
      {id:"hp_m1",label:"Troca de manto",t:"op",ops:["Grosso","Medio","Fino","Extra Fino"]},
      {id:"hp_m2",label:"Troca de revestimento concavo",t:"op",ops:["Grosso","Medio","Fino","Extra Fino"]},
    ]},
    {grupo:"Anel de Ajuste",itens:[
      {id:"hp_a1",label:"Regulagem do CSS (fechamento)",t:"c"},
      {id:"hp_a2",label:"Inspecao dos filetes da rosca",t:"c"},
      {id:"hp_a3",label:"Lubrificacao da rosca (a cada 40h)",t:"c"},
    ]},
    {grupo:"Macaquinho (Sistema de Alivio)",itens:[
      {id:"hp_mq1",label:"Troca do cilindro de alivio",t:"c"},
      {id:"hp_mq2",label:"Troca das vedacoes do macaquinho",t:"c"},
      {id:"hp_mq3",label:"Verificacao da pressao de alivio",t:"c"},
      {id:"hp_mq4",label:"Recarga de nitrogenio do acumulador",t:"c"},
      {id:"hp_mq5",label:"Manutencao geral do macaquinho",t:"c"},
    ]},
    {grupo:"Sistema Hidraulico",itens:[
      {id:"hp_h1",label:"Verificacao da pressao do nitrogenio",t:"c"},
      {id:"hp_h2",label:"Troca de vedacoes do cilindro",t:"c"},
      {id:"hp_h3",label:"Verificacao / recarga de pressao",t:"c"},
    ]},
    {grupo:"Eixo Excentrico",itens:[
      {id:"hp_e1",label:"Troca do bucho excentrico",t:"c"},
      {id:"hp_e2",label:"Inspecao do rolamento de empuxo superior",t:"c"},
      {id:"hp_e3",label:"Inspecao do rolamento de empuxo inferior",t:"c"},
    ]},
    {grupo:"Eixo Horizontal",itens:[
      {id:"hp_x1",label:"Troca dos buchos do eixo horizontal",t:"c"},
      {id:"hp_x2",label:"Alinhamento da polia / correia",t:"c"},
      {id:"hp_x3",label:"Troca da correia",t:"c"},
    ]},
    {grupo:"Cabeca do Britador",itens:[
      {id:"hp_c1",label:"Troca do bucho da cabeca superior",t:"c"},
      {id:"hp_c2",label:"Troca do bucho da cabeca inferior",t:"c"},
      {id:"hp_c3",label:"Troca da bola da cabeca",t:"c"},
      {id:"hp_c4",label:"Troca do liner do soquete",t:"c"},
    ]},
    {grupo:"Aneis de Bronze",itens:[
      {id:"hp_b1",label:"Troca do anel de bronze do excentrico",t:"c"},
      {id:"hp_b2",label:"Troca do anel de bronze interno do eixo horizontal",t:"c"},
      {id:"hp_b3",label:"Troca do anel de bronze externo do eixo horizontal",t:"c"},
      {id:"hp_b4",label:"Inspecao do desgaste dos aneis de bronze",t:"c"},
      {id:"hp_b5",label:"Inspecao da folga dos aneis de bronze",t:"c"},
    ]},
    {grupo:"Caixa de Lubrificacao",itens:[
      {id:"hp_cx1",label:"Troca do oleo da caixa",t:"c"},
      {id:"hp_cx2",label:"Limpeza do filtro de oleo",t:"c"},
      {id:"hp_cx3",label:"Limpeza do reservatorio de oleo",t:"c"},
      {id:"hp_cx4",label:"Troca do filtro de oleo",t:"c"},
      {id:"hp_cx5",label:"Verificacao da bomba de oleo",t:"c"},
      {id:"hp_cx6",label:"Verificacao / limpeza do resfriador de oleo",t:"c"},
      {id:"hp_cx7",label:"Radiador",t:"op",ops:["Limpeza","Troca","Manutencao"]},
      {id:"hp_cx8",label:"Resistencia de aquecimento do oleo",t:"op",ops:["Verificacao","Troca","Manutencao"]},
      {id:"hp_cx9",label:"Valvula de pressao",t:"op",ops:["Verificacao","Regulagem","Troca","Manutencao"]},
      {id:"hp_cx10",label:"Verificacao da temperatura do oleo",t:"c"},
      {id:"hp_cx11",label:"Verificacao do fluxo de oleo",t:"c"},
      {id:"hp_cx12",label:"Manutencao geral da caixa de lubrificacao",t:"c"},
    ]},
    {grupo:"Lubrificacao",itens:[
      {id:"hp_l1",label:"Lubrificacao geral do sistema",t:"c"},
      {id:"hp_l2",label:"Lubrificacao dos cames (a cada 40h)",t:"c"},
      {id:"hp_l3",label:"Troca do oleo do sistema",t:"c"},
      {id:"hp_l4",label:"Limpeza do filtro de oleo",t:"c"},
    ]},
    {grupo:"Redutor de Fechamento",itens:[
      {id:"hp_rf1",label:"Inspecao do redutor de fechamento",t:"c"},
      {id:"hp_rf2",label:"Troca do oleo do redutor",t:"c"},
      {id:"hp_rf3",label:"Troca do redutor de fechamento",t:"c"},
      {id:"hp_rf4",label:"Motor do redutor",t:"op",ops:["Verificacao","Alinhamento","Troca","Manutencao"]},
      {id:"hp_rf5",label:"Reaperto dos parafusos do redutor",t:"c"},
    ]},
    {grupo:"Mangueiras de Lubrificacao",itens:[
      {id:"hp_ml1",label:"Inspecao das mangueiras de lubrificacao",t:"c"},
      {id:"hp_ml2",label:"Troca de mangueira de lubrificacao",t:"c"},
      {id:"hp_ml3",label:"Verificacao de vazamento nas mangueiras",t:"c"},
      {id:"hp_ml4",label:"Reaperto das conexoes das mangueiras",t:"c"},
    ]},
    {grupo:"Mangueiras Hidraulicas",itens:[
      {id:"hp_mh1",label:"Inspecao das mangueiras hidraulicas",t:"c"},
      {id:"hp_mh2",label:"Troca de mangueira hidraulica",t:"c"},
      {id:"hp_mh3",label:"Verificacao de vazamento hidraulico",t:"c"},
      {id:"hp_mh4",label:"Reaperto das conexoes hidraulicas",t:"c"},
    ]},
    {grupo:"Revestimento Interno do Britador",itens:[
      {id:"hp_rv1",label:"Troca do revestimento do chassi",t:"c"},
      {id:"hp_rv2",label:"Troca do revestimento do anel de ajuste",t:"c"},
      {id:"hp_rv3",label:"Inspecao do desgaste do revestimento interno",t:"c"},
    ]},
    {grupo:"Cangalhas",itens:[
      {id:"hp_cg1",label:"Inspecao das cangalhas",t:"c"},
      {id:"hp_cg2",label:"Troca das cangalhas",t:"c"},
      {id:"hp_cg3",label:"Manutencao geral das cangalhas",t:"c"},
    ]},
    {grupo:"Protecao do Contrapeso",itens:[
      {id:"hp_cp1",label:"Inspecao da protecao do contrapeso",t:"c"},
      {id:"hp_cp2",label:"Troca da protecao do contrapeso",t:"c"},
      {id:"hp_cp3",label:"Reaperto dos parafusos da protecao",t:"c"},
      {id:"hp_cp4",label:"Inspecao do desgaste do contrapeso",t:"c"},
    ]},
    {grupo:"Motor",itens:[
      {id:"hp_mo1",label:"Alinhamento",t:"c"},
      {id:"hp_mo2",label:"Troca",t:"c"},
      {id:"hp_mo3",label:"Manutencao",t:"c"},
    ]},
    {grupo:"Estrutura",itens:[
      {id:"hp_es1",label:"Troca do liner do chassi",t:"c"},
      {id:"hp_es2",label:"Solda em geral",t:"c"},
      {id:"hp_es3",label:"Reaperto dos parafusos",t:"c"},
      {id:"hp_es4",label:"Inspecao geral",t:"c"},
    ]},
  ],
  PatriotCone:[
    {grupo:"Manto / Revestimento Concavo",itens:[
      {id:"pa_m1",label:"Troca de manto",t:"op",ops:["Grosso","Medio","Fino","Extra Fino"]},
      {id:"pa_m2",label:"Troca de revestimento concavo (Bowl Liner)",t:"op",ops:["Grosso","Medio","Fino","Extra Fino"]},
    ]},
    {grupo:"Anel de Ajuste",itens:[
      {id:"pa_a1",label:"Regulagem do CSS (fechamento)",t:"c"},
      {id:"pa_a2",label:"Verificacao do travamento hidraulico do anel",t:"c"},
      {id:"pa_a3",label:"Lubrificacao da rosca do anel (a cada 40h)",t:"c"},
      {id:"pa_a4",label:"Inspecao dos filetes da rosca",t:"c"},
    ]},
    {grupo:"Sistema de Alivio (Tramp Relief)",itens:[
      {id:"pa_tr1",label:"Verificacao das vedacoes dos cilindros invertidos",t:"c"},
      {id:"pa_tr2",label:"Verificacao da pressao dos acumuladores",t:"c"},
      {id:"pa_tr3",label:"Recarga de nitrogenio",t:"c"},
      {id:"pa_tr4",label:"Manutencao geral do sistema de alivio",t:"c"},
    ]},
    {grupo:"Automacao Vantage",itens:[
      {id:"pa_v1",label:"Verificacao dos sensores de bowl float",t:"c"},
      {id:"pa_v2",label:"Verificacao do monitoramento de temperatura do oleo",t:"c"},
      {id:"pa_v3",label:"Verificacao do monitoramento de pressao",t:"c"},
      {id:"pa_v4",label:"Verificacao do fluxo de oleo",t:"c"},
      {id:"pa_v5",label:"Calibracao do sistema de compensacao de desgaste",t:"c"},
    ]},
    {grupo:"Cabeca do Britador",itens:[
      {id:"pa_c1",label:"Troca do bucho da cabeca superior",t:"c"},
      {id:"pa_c2",label:"Troca do bucho da cabeca inferior",t:"c"},
      {id:"pa_c3",label:"Troca do socket liner",t:"c"},
      {id:"pa_c4",label:"Inspecao da superficie de assentamento da cabeca",t:"c"},
    ]},
    {grupo:"Aneis de Bronze",itens:[
      {id:"pa_b1",label:"Troca do bucho excentrico",t:"c"},
      {id:"pa_b2",label:"Troca do bucho interno do eixo horizontal",t:"c"},
      {id:"pa_b3",label:"Troca do bucho externo do eixo horizontal",t:"c"},
      {id:"pa_b4",label:"Inspecao do desgaste dos aneis de bronze",t:"c"},
    ]},
    {grupo:"Eixo Excentrico",itens:[
      {id:"pa_e1",label:"Inspecao do rolamento de empuxo superior",t:"c"},
      {id:"pa_e2",label:"Inspecao do rolamento de empuxo inferior",t:"c"},
      {id:"pa_e3",label:"Verificacao do contrapeso e protecao",t:"c"},
    ]},
    {grupo:"Eixo Horizontal",itens:[
      {id:"pa_x1",label:"Alinhamento da polia / correia",t:"c"},
      {id:"pa_x2",label:"Troca da correia",t:"c"},
      {id:"pa_x3",label:"Troca dos buchos do eixo horizontal",t:"c"},
    ]},
    {grupo:"Caixa de Lubrificacao",itens:[
      {id:"pa_cx1",label:"Troca do oleo da caixa",t:"c"},
      {id:"pa_cx2",label:"Limpeza / troca do filtro de oleo",t:"c"},
      {id:"pa_cx3",label:"Limpeza do reservatorio",t:"c"},
      {id:"pa_cx4",label:"Verificacao da bomba de oleo",t:"c"},
      {id:"pa_cx5",label:"Radiador",t:"op",ops:["Limpeza","Troca","Manutencao"]},
      {id:"pa_cx6",label:"Resistencia de aquecimento do oleo",t:"op",ops:["Verificacao","Troca","Manutencao"]},
      {id:"pa_cx7",label:"Valvula de pressao",t:"op",ops:["Verificacao","Regulagem","Troca"]},
    ]},
    {grupo:"Revestimento Interno",itens:[
      {id:"pa_rv1",label:"Troca do revestimento do chassi (arm guard)",t:"c"},
      {id:"pa_rv2",label:"Troca do revestimento do anel de ajuste",t:"c"},
      {id:"pa_rv3",label:"Inspecao do desgaste do revestimento interno",t:"c"},
    ]},
    {grupo:"Mangueiras",itens:[
      {id:"pa_mg1",label:"Inspecao / troca de mangueira de lubrificacao",t:"c"},
      {id:"pa_mg2",label:"Inspecao / troca de mangueira hidraulica",t:"c"},
      {id:"pa_mg3",label:"Verificacao de vazamentos",t:"c"},
    ]},
    {grupo:"Motor",itens:[
      {id:"pa_mo1",label:"Alinhamento do motor",t:"c"},
      {id:"pa_mo2",label:"Troca do motor",t:"c"},
      {id:"pa_mo3",label:"Manutencao geral do motor",t:"c"},
    ]},
    {grupo:"Lubrificacao",itens:[
      {id:"pa_l1",label:"Lubrificacao geral do sistema",t:"c"},
      {id:"pa_l2",label:"Lubrificacao dos cames (a cada 40h)",t:"c"},
    ]},
    {grupo:"Estrutura",itens:[
      {id:"pa_es1",label:"Solda em geral",t:"c"},
      {id:"pa_es2",label:"Reaperto dos parafusos",t:"c"},
      {id:"pa_es3",label:"Inspecao geral",t:"c"},
    ]},
  ],
  LibertyJaw:[
    {grupo:"Chapas de Mandibula",itens:[
      {id:"lj_m1",label:"Troca da chapa de mandibula fixa",t:"c"},
      {id:"lj_m2",label:"Troca da chapa de mandibula movel",t:"c"},
      {id:"lj_m3",label:"Virada da chapa de mandibula fixa",t:"c"},
      {id:"lj_m4",label:"Virada da chapa de mandibula movel",t:"c"},
    ]},
    {grupo:"Placas Laterais (Cheek Plates)",itens:[
      {id:"lj_cp1",label:"Troca da placa lateral  -  lado D",t:"c"},
      {id:"lj_cp2",label:"Troca da placa lateral  -  lado E",t:"c"},
      {id:"lj_cp3",label:"Inspecao do desgaste das placas laterais",t:"c"},
    ]},
    {grupo:"Ajuste do CSS (Fechamento)",itens:[
      {id:"lj_css1",label:"Regulagem hidraulica do CSS",t:"v",placeholder:"Ex: 100"},
      {id:"lj_css2",label:"Verificacao do sistema hidraulico de ajuste",t:"c"},
      {id:"lj_css3",label:"Inspecao das cunhas de ajuste",t:"op",ops:["Inspecao","Reaperto","Troca"]},
    ]},
    {grupo:"Pitman (Biela)",itens:[
      {id:"lj_p1",label:"Inspecao do pitman",t:"c"},
      {id:"lj_p2",label:"Troca da protecao do pitman (pitman toe)",t:"c"},
      {id:"lj_p3",label:"Verificacao dos rolamentos do pitman",t:"c"},
      {id:"lj_p4",label:"Troca dos rolamentos do pitman",t:"c"},
    ]},
    {grupo:"Eixo Excentrico",itens:[
      {id:"lj_e1",label:"Inspecao do eixo excentrico",t:"c"},
      {id:"lj_e2",label:"Verificacao dos rolamentos do eixo",t:"c"},
      {id:"lj_e3",label:"Troca dos rolamentos do eixo excentrico",t:"c"},
    ]},
    {grupo:"Correias e Motor",itens:[
      {id:"lj_cr1",label:"Correias do motor",t:"op",ops:["Troca","Alinhamento","Inspecao"]},
      {id:"lj_cr2",label:"Polia do motor",t:"op",ops:["Alinhamento","Troca","Inspecao"]},
      {id:"lj_cr3",label:"Motor",t:"op",ops:["Alinhamento","Reaperto","Troca","Manutencao"]},
    ]},
    {grupo:"Protecao / Guarda",itens:[
      {id:"lj_g1",label:"Inspecao / troca da guarda composta do motor",t:"c"},
      {id:"lj_g2",label:"Inspecao da protecao geral",t:"c"},
    ]},
    {grupo:"Lubrificacao",itens:[
      {id:"lj_l1",label:"Lubrificacao dos rolamentos",t:"c"},
      {id:"lj_l2",label:"Lubrificacao do eixo excentrico",t:"c"},
      {id:"lj_l3",label:"Lubrificacao geral",t:"c"},
    ]},
    {grupo:"Estrutura",itens:[
      {id:"lj_es1",label:"Solda em geral",t:"c"},
      {id:"lj_es2",label:"Reaperto dos parafusos",t:"c"},
      {id:"lj_es3",label:"Inspecao geral da estrutura",t:"c"},
    ]},
  ],
    C125:[
    {grupo:"Mandibulas",itens:[
      {id:"bm1",label:"Mandibula fixa",t:"op",ops:["Troca","Virada"]},
      {id:"bm2",label:"Mandibula movel",t:"op",ops:["Troca","Virada"]},
    ]},
    {grupo:"Fechamento",itens:[
      {id:"bf1",label:"Medicao do vao (polegadas)",t:"v",placeholder:"Ex: 8.5"},
      {id:"bf2",label:"Calco das cunhas  -  Colocando",t:"c"},
      {id:"bf3",label:"Calco das cunhas  -  Retirando",t:"c"},
      {id:"bf4",label:"Calco das cunhas  -  Manutencao",t:"c"},
    ]},
    {grupo:"Cunhas Laterais",itens:[
      {id:"bc1",label:"Cunha superior  -  lado D",t:"op",ops:["Troca","Reaperto","Troca de parafusos"]},
      {id:"bc2",label:"Cunha superior  -  lado E",t:"op",ops:["Troca","Reaperto","Troca de parafusos"]},
      {id:"bc3",label:"Cunha inferior  -  lado D",t:"op",ops:["Troca","Reaperto","Troca de parafusos"]},
      {id:"bc4",label:"Cunha inferior  -  lado E",t:"op",ops:["Troca","Reaperto","Troca de parafusos"]},
    ]},
    {grupo:"Abanadeira",itens:[
      {id:"ba1",label:"Abanadeira",t:"op",ops:["Troca","Alinhamento","Manutencao"]},
    ]},
    {grupo:"Calhas da Abanadeira",itens:[
      {id:"bca1",label:"Calha superior",t:"op",ops:["Troca","Reaperto","Alinhamento","Manutencao"]},
      {id:"bca2",label:"Calha inferior",t:"op",ops:["Troca","Reaperto","Alinhamento","Manutencao"]},
    ]},
    {grupo:"Calcos das Mandibulas",itens:[
      {id:"bcm1",label:"Calco movel superior  -  Mandibula fixa",t:"op",ops:["Troca","Troca de parafusos","Reaperto","Manutencao"]},
      {id:"bcm2",label:"Calco movel superior  -  Mandibula movel",t:"op",ops:["Troca","Troca de parafusos","Reaperto","Manutencao"]},
      {id:"bcm3",label:"Calco fixo inferior  -  Mandibula fixa",t:"op",ops:["Troca","Troca de parafusos","Reaperto","Manutencao"]},
      {id:"bcm4",label:"Calco fixo inferior  -  Mandibula movel",t:"op",ops:["Troca","Troca de parafusos","Reaperto","Manutencao"]},
    ]},
    {grupo:"Motor",itens:[
      {id:"bmo1",label:"Motor",t:"op",ops:["Alinhamento","Reaperto","Manutencao"]},
    ]},
    {grupo:"Correias do Motor",itens:[
      {id:"bcr1",label:"Correias do motor",t:"op",ops:["Troca","Alinhamento","Manutencao"]},
    ]},
    {grupo:"Lubrificacao",itens:[
      {id:"bl1",label:"Lubrificacao geral",t:"c"},
    ]},
    {grupo:"Estrutura",itens:[
      {id:"bs1",label:"Solda em geral",t:"c"},
      {id:"bs2",label:"Reaperto dos parafusos (torquimetro)",t:"c"},
    ]},
  ],
};

const TIPOS_EQ = ["Transportadora de Correia","Britador Conico","Britador de Mandibula","Peneira de Separacao","Alimentador","Outro"];
const TIPOS_MANUT = ["Manutencao Preventiva","Manutencao Corretiva","Manutencao Preditiva","Inspecao","Lubrificacao","Troca de Pecas","Ajuste / Regulagem","Emergencia"];
const COR_ST = { "Em Andamento":"#FF6B2B", "Concluida":"#22C55E", "Aguardando":"#F59E0B" };

// ===========================================================
// HELPERS
// ===========================================================
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5);
const fmtT = iso => iso ? new Date(iso).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) : " - ";
const fmtD = (s,e) => { if(!s) return " - "; const m=Math.floor((new Date(e||Date.now())-new Date(s))/60000); if(m<1) return "<1min"; return m<60?`${m}min`:`${Math.floor(m/60)}h ${m%60}min`; };

// ===========================================================
// STYLES
// ===========================================================
const C = {
  bg:     "#060f18",
  card:   "#0a1520",
  border: "#1e3044",
  orange: "#FF6B2B",
  green:  "#22C55E",
  yellow: "#F59E0B",
  text:   "#deeaf5",
  muted:  "#4a6a7a",
  input:  { width:"100%", boxSizing:"border-box", padding:"11px 13px", borderRadius:10, border:"1.5px solid #1e3044", background:"#0a1520", color:"#deeaf5", fontSize:15, outline:"none", fontFamily:"inherit" },
};

// ===========================================================
// ICONS
// ===========================================================
const p = (s=18) => ({width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"});
const IcoWrench  = ({s=16}) => <svg {...p(s)}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IcoChart   = ({s=16}) => <svg {...p(s)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoPlus    = ({s=16}) => <svg {...p(s)}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoCheck   = ({s=16}) => <svg {...p(s)}><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX       = ({s=16}) => <svg {...p(s)}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoUser    = ({s=16}) => <svg {...p(s)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoBuilding= ({s=16}) => <svg {...p(s)}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="7" x2="15" y2="7"/><line x1="15" y1="12" x2="15" y2="12"/><line x1="15" y1="17" x2="15" y2="17"/></svg>;
const IcoGear    = ({s=16}) => <svg {...p(s)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IcoList    = ({s=16}) => <svg {...p(s)}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcoLogout  = ({s=16}) => <svg {...p(s)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoRef     = ({s=16}) => <svg {...p(s)}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IcoTrash   = ({s=16}) => <svg {...p(s)}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoAlert   = ({s=16}) => <svg {...p(s)}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

// ===========================================================
// MINI COMPONENTS
// ===========================================================
const Lbl = ({t}) => <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{t}</div>;
const Fld = ({label,children}) => <div style={{marginBottom:14}}><Lbl t={label}/>{children}</div>;
const Kv  = ({l,v,hi}) => <div style={{background:"#091420",borderRadius:8,padding:"7px 10px"}}><div style={{fontSize:10,color:"#3a5a6a",marginBottom:2}}>{l}</div><div style={{fontSize:12,color:hi?C.orange:C.text,fontWeight:hi?700:500}}>{v||" - "}</div></div>;
const Box = ({on,color=C.orange,size=22}) => <div style={{width:size,height:size,borderRadius:6,flexShrink:0,border:on?`2px solid ${color}`:"2px solid #2a3f54",background:on?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>{on&&<IcoCheck s={size-8}/>}</div>;
const Tag = ({label,color=C.orange}) => <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:color+"22",color,border:`1px solid ${color}44`,fontWeight:600}}>{label}</span>;
const Spin = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{animation:"spin .7s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

const Btn = ({onClick,children,color=C.orange,outline=false,disabled=false,full=false,sm=false}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: sm?"8px 14px":"12px 18px", borderRadius:10, border: outline?`1.5px solid ${color}`:"none",
    background: outline?"transparent": disabled?"#1e2e3e":`linear-gradient(135deg,${color},${color}cc)`,
    color: outline?color:"#fff", fontSize: sm?13:14, fontWeight:700, cursor:disabled?"not-allowed":"pointer",
    display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"inherit",
    width:full?"100%":"auto", opacity:disabled?0.5:1, transition:"all .2s",
    boxShadow: !outline&&!disabled?`0 4px 14px ${color}44`:"none",
  }}>{children}</button>
);

const Card = ({children, style={}}) => (
  <div style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:14,padding:16,...style}}>
    {children}
  </div>
);

const Modal = ({title,onClose,children}) => (
  <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#0c1928",border:`1.5px solid ${C.border}`,borderRadius:16,padding:20,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text}}>{title}</div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",display:"flex"}}><IcoX s={20}/></button>
      </div>
      {children}
    </div>
  </div>
);

// ===========================================================
// BAR CHART
// ===========================================================
const BarChart = ({dados,cor,unidade}) => {
  if(!dados?.length) return <div style={{textAlign:"center",padding:20,color:C.muted,fontSize:13}}>Sem dados no periodo</div>;
  const max = Math.max(...dados.map(d=>d.v),1);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {dados.map(d=>(
        <div key={d.id}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:11,color:C.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:8}}>{d.nome}</span>
            <span style={{fontSize:11,color:cor,fontWeight:700,flexShrink:0}}>{unidade==="h"?(d.v/60).toFixed(1)+"h":d.v}</span>
          </div>
          <div style={{height:8,background:"#0d1820",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:(d.v/max*100)+"%",background:cor,borderRadius:4,transition:"width .4s ease",minWidth:d.v>0?4:0}}/>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===========================================================
// LOGIN PAGE
// ===========================================================
function LoginPage({onLogin}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Demo users para testar sem Supabase
  const DEMO_USERS = [
    { email:"admin@ceballos.com",    senha:"admin123",    perfil:"admin",    nome:"Eng. Sergio Cardoso",  pedreira_id:null, pedreira_nome:"Todas" },
    { email:"gerente@pedreira1.com", senha:"gerente123",  perfil:"gerente",  nome:"Gerente Teste 01",     pedreira_id:"p1", pedreira_nome:"Pedreira Teste 01" },
    { email:"operador@pedreira1.com",senha:"operador123", perfil:"operador", nome:"Operador Teste 01",    pedreira_id:"p1", pedreira_nome:"Pedreira Teste 01" },
    // Usuarios cadastrados pelo admin ficam aqui via localStorage
    ...(()=>{ try{ return JSON.parse(localStorage.getItem("maintenpro_users")||"[]"); }catch{ return []; } })(),
  ];

  const handleLogin = async () => {
    if(!email||!senha) return;
    setLoading(true); setErro("");

    // 1. Verifica se email existe nos usuarios demo
    const demoByEmail = DEMO_USERS.find(u=>u.email===email);
    if(demoByEmail){
      // Email encontrado  -  verifica senha
      if(demoByEmail.senha===senha){
        setLoading(false);
        onLogin(demoByEmail);
        return;
      } else {
        setErro("Senha incorreta. Verifique e tente novamente.");
        setLoading(false);
        return;
      }
    }

    // 2. Tenta Supabase se nao for usuario demo
    try {
      const res = await sb.login(email,senha);
      if(res.access_token){
        const users = await sb.get("usuarios",`email=eq.${email}&select=*,pedreiras(nome)`);
        if(users[0]) onLogin({...users[0], pedreira_nome:users[0].pedreiras?.nome});
        else setErro("Usuario nao encontrado no sistema.");
      } else {
        setErro("Email ou senha incorretos. Verifique seus dados.");
      }
    } catch {
      // Supabase nao configurado  -  usuario nao e demo
      setErro("Email nao encontrado. Verifique o email digitado.");
    }
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Barlow','Segoe UI',sans-serif"}}>
      <div style={{width:"100%",maxWidth:380}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#FF6B2B,#ff9057)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px #FF6B2B55"}}>
            <IcoWrench s={30}/>
          </div>
          <div style={{fontSize:26,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:C.orange,letterSpacing:.5}}>CEBALLOS</div>
          <div style={{fontSize:18,fontWeight:700,color:C.text,marginTop:-4}}>MaintenPro</div>
          <div style={{fontSize:12,color:C.muted,marginTop:6}}>Sistema de Controle de Manutenção</div>
        </div>

        <Card>
          <Fld label="Email">
            <input style={C.input} type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          </Fld>
          <Fld label="Senha">
            <input style={C.input} type="password" placeholder="********" value={senha} onChange={e=>setSenha(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          </Fld>
          {erro && <div style={{display:"flex",gap:6,padding:"8px 12px",background:"#160808",border:"1px solid #3a1010",borderRadius:8,marginBottom:12,fontSize:12,color:"#ef4444"}}><IcoAlert s={14}/>{erro}</div>}
          <Btn onClick={handleLogin} disabled={!email||!senha||loading} full>{loading?<><Spin/>Entrando...</>:"Entrar"}</Btn>
        </Card>

        {/* Demo hint */}
        <div style={{marginTop:20,padding:"12px 16px",background:"#0a1520",borderRadius:10,border:"1px dashed #1e3044"}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700}}>ACESSO DEMO:</div>
          <div style={{fontSize:11,color:"#5a7a8a",lineHeight:1.8}}>
            Admin: admin@ceballos.com / admin123<br/>
            Gerente: gerente@pedreira1.com / gerente123<br/>
            Operador: operador@pedreira1.com / operador123
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================
// ADMIN - GERENCIAR PEDREIRAS
// ===========================================================
function AdminPedreiras() {
  const [pedreiras, setPedreiras] = useState([
    {id:"p1",nome:"Pedreira Teste 01",localizacao:"A definir",ativa:true,operadores:0,gerentes:0},
    {id:"p2",nome:"Dumar Pedreira Itariri",localizacao:"Itariri - SP",ativa:true,operadores:0,gerentes:0},
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({nome:"",localizacao:""});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const adicionar = () => {
    if(!form.nome) return;
    setPedreiras(p=>[...p,{id:uid(),nome:form.nome,localizacao:form.localizacao,ativa:true,operadores:0,gerentes:0}]);
    setForm({nome:"",localizacao:""}); setModal(false);
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:1}}>ADMINISTRADOR</div><div style={{fontSize:18,fontWeight:800}}>Pedreiras Cadastradas</div></div>
        <Btn onClick={()=>setModal(true)} sm><IcoPlus s={14}/> Nova</Btn>
      </div>

      {pedreiras.map(p=>(
        <Card key={p.id} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:3}}>{p.nome}</div>
              <div style={{fontSize:12,color:C.muted}}>{p.localizacao}</div>
            </div>
            <Tag label={p.ativa?"Ativa":"Inativa"} color={p.ativa?C.green:"#ef4444"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <Kv l="GERENTES" v={p.gerentes}/>
            <Kv l="OPERADORES" v={p.operadores}/>
            <Kv l="STATUS" v={p.ativa?"Online":"Off"}/>
          </div>
        </Card>
      ))}

      {modal&&(
        <Modal title="Nova Pedreira" onClose={()=>setModal(false)}>
          <Fld label="Nome da Pedreira *"><input style={C.input} placeholder="Ex: Pedreira Gamma" value={form.nome} onChange={e=>set("nome",e.target.value)}/></Fld>
          <Fld label="Localização"><input style={C.input} placeholder="Ex: Belo Horizonte, MG" value={form.localizacao} onChange={e=>set("localizacao",e.target.value)}/></Fld>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={()=>setModal(false)} outline full>Cancelar</Btn>
            <Btn onClick={adicionar} full disabled={!form.nome}><IcoPlus s={14}/> Cadastrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===========================================================
// ADMIN - GERENCIAR USUARIOS
// ===========================================================
function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([
    {id:"u1",nome:"Eng. Sergio Cardoso",email:"admin@ceballos.com",perfil:"admin",pedreira:"Todas",ativo:true},
    {id:"u2",nome:"Gerente Teste 01",email:"gerente@pedreira1.com",perfil:"gerente",pedreira:"Pedreira Teste 01",ativo:true},
    {id:"u3",nome:"Operador Teste 01",email:"operador@pedreira1.com",perfil:"operador",pedreira:"Pedreira Teste 01",ativo:true},
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({nome:"",email:"",senha:"",perfil:"operador",pedreira:""});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const cores = {admin:"#a855f7",gerente:C.yellow,operador:C.orange};

  const pedreiras = {"p1":"Pedreira Teste 01","p2":"Dumar Pedreira Itariri"};

  const cadastrar = () => {
    if(!form.nome||!form.email||!form.senha||!form.pedreira) return;
    // Salva no localStorage para persistir entre sessoes
    const novoUser = {
      id: Date.now().toString(36),
      nome: form.nome,
      email: form.email,
      senha: form.senha,
      perfil: form.perfil,
      pedreira: pedreiras[form.pedreira]||form.pedreira,
      pedreira_id: form.pedreira,
      pedreira_nome: pedreiras[form.pedreira]||form.pedreira,
      ativo: true,
    };
    const novosUsuarios = [...usuarios, novoUser];
    setUsuarios(novosUsuarios);
    // Salva no localStorage para login funcionar
    try {
      const saved = JSON.parse(localStorage.getItem("maintenpro_users")||"[]");
      localStorage.setItem("maintenpro_users", JSON.stringify([...saved, novoUser]));
    } catch {}
    setForm({nome:"",email:"",senha:"",perfil:"operador",pedreira:""});
    setModal(false);
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:1}}>ADMINISTRADOR</div><div style={{fontSize:18,fontWeight:800}}>Usuários do Sistema</div></div>
        <Btn onClick={()=>setModal(true)} sm><IcoPlus s={14}/> Novo</Btn>
      </div>

      {usuarios.map(u=>(
        <Card key={u.id} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:cores[u.perfil]+"22",border:`2px solid ${cores[u.perfil]}44`,display:"flex",alignItems:"center",justifyContent:"center",color:cores[u.perfil]}}>
                <IcoUser s={16}/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:u.ativo?C.text:"#5a7a8a"}}>{u.nome}</div>
                <div style={{fontSize:11,color:C.muted}}>{u.pedreira}</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <Tag label={u.perfil} color={cores[u.perfil]}/>
              <Tag label={u.ativo?"Ativo":"Inativo"} color={u.ativo?C.green:"#ef4444"}/>
            </div>
          </div>
        </Card>
      ))}

      {modal&&(
        <Modal title="Novo Usuário" onClose={()=>setModal(false)}>
          <Fld label="Nome *"><input style={C.input} placeholder="Nome completo" value={form.nome} onChange={e=>set("nome",e.target.value)}/></Fld>
          <Fld label="Email *"><input style={C.input} type="email" placeholder="email@exemplo.com" value={form.email} onChange={e=>set("email",e.target.value)}/></Fld>
          <Fld label="Senha *"><input style={C.input} type="password" placeholder="Senha inicial" value={form.senha} onChange={e=>set("senha",e.target.value)}/></Fld>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Fld label="Perfil">
              <select style={C.input} value={form.perfil} onChange={e=>set("perfil",e.target.value)}>
                <option value="operador">Operador</option>
                <option value="gerente">Gerente</option>
              </select>
            </Fld>
            <Fld label="Pedreira">
              <select style={C.input} value={form.pedreira} onChange={e=>set("pedreira",e.target.value)}>
                <option value="">Selecione...</option>
                <option value="p1">Pedreira Teste 01</option>
                <option value="p2">Dumar Pedreira Itariri</option>
              </select>
            </Fld>
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={()=>setModal(false)} outline full>Cancelar</Btn>
            <Btn onClick={cadastrar} full disabled={!form.nome||!form.email||!form.senha||!form.pedreira}><IcoPlus s={14}/> Cadastrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===========================================================
// ADMIN - GERENCIAR EQUIPAMENTOS
// ===========================================================
function AdminEquipamentos() {
  const [equips, setEquips] = useState([
    {id:"e1", codigo:"TC01",    nome:"TC 01 - Primario",               tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e2", codigo:"TC02",    nome:"TC 02 - Rejeito",                tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e3", codigo:"TC03",    nome:"TC 03 - Pulmao Rachao",          tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e4", codigo:"TC04",    nome:"TC 04 - Britadores",             tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e5", codigo:"TC05",    nome:"TC 05 - P. METSO",               tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e6", codigo:"TC06",    nome:"TC 06 - P. 01 L.V.",             tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e7", codigo:"TC07",    nome:"TC 07 - Pedrisco L.V.",          tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e8", codigo:"TC08",    nome:"TC 08 - Po P.V.",                tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e9", codigo:"TC09",    nome:"TC 09 - Fora de uso",            tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:false},
    {id:"e10",codigo:"TC10",    nome:"TC 10 - Pulmao HP Terciario",    tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e11",codigo:"TC11",    nome:"TC 11 - Fora de uso",            tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:false},
    {id:"e12",codigo:"TC12",    nome:"TC 12 - Pulmao Rachaozinho L.V.",tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e13",codigo:"TC13",    nome:"TC 13 - P. EMIC e P. REMASO",   tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e14",codigo:"TC14",    nome:"TC 14 - Fora de uso",            tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:false},
    {id:"e15",codigo:"TC15",    nome:"TC 15 - Pulmao Rachaozinho L.N.",tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e16",codigo:"TC16",    nome:"TC 16 - P. 01 L.N.",             tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e17",codigo:"TC17",    nome:"TC 17 - Po L.N.",                tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e18",codigo:"TC18",    nome:"TC 18 - Pedrisco L.N.",          tipo:"Transportadora de Correia", pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e19",codigo:"HP400-1", nome:"Britador HP400 Secundario",      tipo:"Britador Conico",           pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e20",codigo:"HP400-2", nome:"Britador HP400 Terciario",       tipo:"Britador Conico",           pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e21",codigo:"C125",    nome:"Britador Mandibula C125 Metso",  tipo:"Britador de Mandibula",     pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e22",codigo:"AL01",    nome:"Alimentador Calha Vibratoria #1",tipo:"Alimentador",               pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e23",codigo:"AL02",    nome:"Alimentador Calha Vibratoria #2",tipo:"Alimentador",               pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e24",codigo:"AL03",    nome:"Alimentador Calha Vibratoria #3",tipo:"Alimentador",               pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e25",codigo:"CVBP",    nome:"Calha Vibratoria Britador Primario",tipo:"Alimentador",            pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e26",codigo:"PEN01",   nome:"Peneira TDA",                    tipo:"Peneira de Separacao",      pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e27",codigo:"PEN02",   nome:"Peneira EMIC",                   tipo:"Peneira de Separacao",      pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e28",codigo:"PEN03",   nome:"Peneira METSO",                  tipo:"Peneira de Separacao",      pedreira:"Pedreira Teste 01", ativo:true},
    {id:"e29",codigo:"PEN04",   nome:"Peneira REMASO",                 tipo:"Peneira de Separacao",      pedreira:"Pedreira Teste 01", ativo:true},
    // Dumar Pedreira Itariri
    {id:"d1", codigo:"AV-01",   nome:"Alimentador Vibratorio Intrepid 5424VGF",tipo:"Alimentador",            pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d2", codigo:"BR-01",   nome:"Britador de Mandibulas Liberty 4051B",   tipo:"Britador de Mandibula",  pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d3", codigo:"CV-01",   nome:"Calha Vibratoria PF365-GAE #1",          tipo:"Alimentador",            pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d4", codigo:"CV-02",   nome:"Calha Vibratoria PF365-GAE #2",          tipo:"Alimentador",            pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d5", codigo:"PV-01",   nome:"Peneira Vibratoria Anthem 5162-SI",      tipo:"Peneira de Separacao",   pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d6", codigo:"BR-02",   nome:"Britador Conico Patriot P300",           tipo:"Britador Conico",        pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d7", codigo:"BR-03",   nome:"Britador Conico Patriot P200",           tipo:"Britador Conico",        pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d8", codigo:"CV-02b",  nome:"Calha Vibratoria PF365-GAE #3",          tipo:"Alimentador",            pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d9", codigo:"PV-02",   nome:"Peneira Inclinada Anthem 8203-SI",       tipo:"Peneira de Separacao",   pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d10",codigo:"PV-03",   nome:"Peneira Inclinada Anthem 8243-SI",       tipo:"Peneira de Separacao",   pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d11",codigo:"TC-01",   nome:"TC-01 Transportadora 42x9m",             tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d12",codigo:"TC-02",   nome:"TC-02 Transportadora 42x46m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d13",codigo:"TC-03",   nome:"TC-03 Transportadora 36x34m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d14",codigo:"TC-04",   nome:"TC-04 Transportadora 36x26m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d15",codigo:"TC-05",   nome:"TC-05 Transportadora 30x34m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d16",codigo:"TC-06",   nome:"TC-06 Transportadora 20x34m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d17",codigo:"TC-07",   nome:"TC-07 Transportadora 42x14m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d18",codigo:"TC-08",   nome:"TC-08 Transportadora 42x42m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d19",codigo:"TC-09",   nome:"TC-09 Transportadora 30x43m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d20",codigo:"TC-10",   nome:"TC-10 Transportadora 30x58m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d21",codigo:"TC-11",   nome:"TC-11 Transportadora 20x51m",            tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d22",codigo:"TC-12",   nome:"TC-12 Transportadora Empilhador 24x21m", tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d23",codigo:"TC-13",   nome:"TC-13 Transportadora Empilhador 20x25m", tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d24",codigo:"TC-14",   nome:"TC-14 Transportadora Empilhador 20x29m", tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d25",codigo:"TC-15",   nome:"TC-15 Transportadora Empilhador 20x33m", tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
    {id:"d26",codigo:"TC-16",   nome:"TC-16 Transportadora Empilhador 24x56m", tipo:"Transportadora de Correia",pedreira:"Dumar Pedreira Itariri", ativo:true},
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({codigo:"",nome:"",tipo:"Transportadora de Correia",pedreira:""});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const cores = {
    "Transportadora de Correia": C.orange,
    "Britador Conico": C.yellow,
    "Britador de Mandibula": "#a855f7",
    "Peneira de Separacao": C.green,
    "Alimentador": "#06b6d4",
    "Outro": C.muted,
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:11,color:C.muted,letterSpacing:1}}>ADMINISTRADOR</div><div style={{fontSize:18,fontWeight:800}}>Equipamentos</div></div>
        <Btn onClick={()=>setModal(true)} sm><IcoPlus s={14}/> Novo</Btn>
      </div>

      {equips.map(e=>(
        <Card key={e.id} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                <span style={{fontSize:11,fontWeight:800,color:C.orange}}>{e.codigo}</span>
                <Tag label={e.tipo.split(" ")[0]} color={cores[e.tipo]||C.muted}/>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>{e.nome}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{e.pedreira}</div>
            </div>
            <Tag label={e.ativo?"Ativo":"Inativo"} color={e.ativo?C.green:"#ef4444"}/>
          </div>
        </Card>
      ))}

      {modal&&(
        <Modal title="Novo Equipamento" onClose={()=>setModal(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
            <Fld label="Codigo *"><input style={C.input} placeholder="TC01" value={form.codigo} onChange={e=>set("codigo",e.target.value)}/></Fld>
            <Fld label="Nome *"><input style={C.input} placeholder="TC 01 - Primario" value={form.nome} onChange={e=>set("nome",e.target.value)}/></Fld>
          </div>
          <Fld label="Tipo *">
            <select style={C.input} value={form.tipo} onChange={e=>set("tipo",e.target.value)}>
              {TIPOS_EQ.map(t=><option key={t}>{t}</option>)}
            </select>
          </Fld>
          <Fld label="Pedreira *">
            <select style={C.input} value={form.pedreira} onChange={e=>set("pedreira",e.target.value)}>
              <option value="">Selecione...</option>
              <option value="p1">Pedreira Teste 01</option>
              <option value="p2">Dumar Pedreira Itariri</option>
            </select>
          </Fld>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn onClick={()=>setModal(false)} outline full>Cancelar</Btn>
            <Btn onClick={()=>setModal(false)} full disabled={!form.codigo||!form.nome||!form.pedreira}><IcoPlus s={14}/> Cadastrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===========================================================
// OPERATOR - FORM
// ===========================================================
const DEMO_EQUIPS = [
  {id:"e1", codigo:"TC01",    nome:"TC 01 - Primario",                tipo:"Transportadora de Correia"},
  {id:"e2", codigo:"TC02",    nome:"TC 02 - Rejeito",                 tipo:"Transportadora de Correia"},
  {id:"e3", codigo:"TC03",    nome:"TC 03 - Pulmao Rachao",           tipo:"Transportadora de Correia"},
  {id:"e4", codigo:"TC04",    nome:"TC 04 - Britadores",              tipo:"Transportadora de Correia"},
  {id:"e5", codigo:"TC05",    nome:"TC 05 - P. METSO",                tipo:"Transportadora de Correia"},
  {id:"e6", codigo:"TC06",    nome:"TC 06 - P. 01 L.V.",              tipo:"Transportadora de Correia"},
  {id:"e7", codigo:"TC07",    nome:"TC 07 - Pedrisco L.V.",           tipo:"Transportadora de Correia"},
  {id:"e8", codigo:"TC08",    nome:"TC 08 - Po P.V.",                 tipo:"Transportadora de Correia"},
  {id:"e9", codigo:"TC09",    nome:"TC 09 - Fora de uso",             tipo:"Transportadora de Correia"},
  {id:"e10",codigo:"TC10",    nome:"TC 10 - Pulmao HP Terciario",     tipo:"Transportadora de Correia"},
  {id:"e11",codigo:"TC11",    nome:"TC 11 - Fora de uso",             tipo:"Transportadora de Correia"},
  {id:"e12",codigo:"TC12",    nome:"TC 12 - Pulmao Rachaozinho L.V.", tipo:"Transportadora de Correia"},
  {id:"e13",codigo:"TC13",    nome:"TC 13 - P. EMIC e P. REMASO",    tipo:"Transportadora de Correia"},
  {id:"e14",codigo:"TC14",    nome:"TC 14 - Fora de uso",             tipo:"Transportadora de Correia"},
  {id:"e15",codigo:"TC15",    nome:"TC 15 - Pulmao Rachaozinho L.N.", tipo:"Transportadora de Correia"},
  {id:"e16",codigo:"TC16",    nome:"TC 16 - P. 01 L.N.",              tipo:"Transportadora de Correia"},
  {id:"e17",codigo:"TC17",    nome:"TC 17 - Po L.N.",                 tipo:"Transportadora de Correia"},
  {id:"e18",codigo:"TC18",    nome:"TC 18 - Pedrisco L.N.",           tipo:"Transportadora de Correia"},
  {id:"e19",codigo:"HP400-1", nome:"Britador HP400 Secundario",       tipo:"Britador Conico"},
  {id:"e20",codigo:"HP400-2", nome:"Britador HP400 Terciario",        tipo:"Britador Conico"},
  {id:"e21",codigo:"C125",    nome:"Britador Mandibula C125 Metso",   tipo:"Britador de Mandibula"},
  {id:"e22",codigo:"AL01",    nome:"Alimentador Calha Vibratoria #1", tipo:"Alimentador"},
  {id:"e23",codigo:"AL02",    nome:"Alimentador Calha Vibratoria #2", tipo:"Alimentador"},
  {id:"e24",codigo:"AL03",    nome:"Alimentador Calha Vibratoria #3", tipo:"Alimentador"},
  {id:"e25",codigo:"CVBP",    nome:"Calha Vibratoria Britador Primario",tipo:"Alimentador"},
  {id:"e26",codigo:"PEN01",   nome:"Peneira TDA",                     tipo:"Peneira de Separacao"},
  {id:"e27",codigo:"PEN02",   nome:"Peneira EMIC",                    tipo:"Peneira de Separacao"},
  {id:"e28",codigo:"PEN03",   nome:"Peneira METSO",                   tipo:"Peneira de Separacao"},
  {id:"e29",codigo:"PEN04",   nome:"Peneira REMASO",                  tipo:"Peneira de Separacao"},
];


// -- FOTO UPLOAD --
function FotoUpload({fotos, onChange}) {
  const inputRef = React.useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange(prev => [...prev, {
          id: uid(),
          url: ev.target.result,
          nome: file.name,
          tamanho: (file.size/1024).toFixed(0)+"KB"
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const remover = (id) => onChange(prev => prev.filter(f => f.id !== id));

  return (
    <div style={{marginBottom:16}}>
      <Lbl t="Fotos do Serviço"/>
      
      {/* Botão adicionar foto */}
      <div
        onClick={() => inputRef.current.click()}
        style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          padding:"14px", borderRadius:12,
          border:`2px dashed ${C.border}`,
          background:C.card, cursor:"pointer",
          marginBottom: fotos.length > 0 ? 12 : 0,
          transition:"all .2s",
        }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.orange}}>Adicionar Fotos</div>
          <div style={{fontSize:11,color:C.muted}}>Toque para abrir a camera ou galeria</div>
        </div>
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFiles}
        style={{display:"none"}}
      />

      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {fotos.map(foto => (
            <div key={foto.id} style={{position:"relative",borderRadius:10,overflow:"hidden",border:`1.5px solid ${C.border}`}}>
              <img src={foto.url} alt={foto.nome} style={{width:"100%",height:90,objectFit:"cover",display:"block"}}/>
              <button
                onClick={() => remover(foto.id)}
                style={{
                  position:"absolute", top:4, right:4,
                  width:22, height:22, borderRadius:"50%",
                  background:"#ef444499", border:"none",
                  color:"#fff", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  padding:0,
                }}
              >
                <IcoX s={12}/>
              </button>
              <div style={{padding:"3px 6px",background:"#00000088",fontSize:10,color:"#fff"}}>{foto.tamanho}</div>
            </div>
          ))}
        </div>
      )}

      {fotos.length > 0 && (
        <div style={{marginTop:8,fontSize:12,color:C.muted,display:"flex",alignItems:"center",gap:5}}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {fotos.length} foto{fotos.length>1?"s":""} adicionada{fotos.length>1?"s":""}
        </div>
      )}
    </div>
  );
}

// -- CHECKLIST COMPONENT --
function ChecklistGrupos({grupos, itens, onChange}) {
  const total = Object.values(itens).filter(v=>v.on).length;
  const toggle = id => { const cur=itens[id]||{on:false,qty:"",op:"",val:""}; onChange({...itens,[id]:{...cur,on:!cur.on}}); };
  const upd = (id,patch) => { const cur=itens[id]||{on:true,qty:"",op:"",val:""}; onChange({...itens,[id]:{...cur,...patch}}); };
  const sm = {padding:"6px 9px",borderRadius:7,border:"1.5px solid #2a4a5a",background:"#071018",color:"#deeaf5",fontSize:13,outline:"none",fontFamily:"inherit"};
  return(
    <div style={{marginBottom:15}}>
      <Lbl t="Servicos Realizados *"/>
      <div style={{borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
        {grupos.map((g,gi)=>(
          <div key={g.grupo}>
            <div style={{padding:"7px 13px",background:"#0d1e2e",borderTop:gi>0?"1px solid #152535":"none",fontSize:11,fontWeight:800,color:C.orange,letterSpacing:1,textTransform:"uppercase"}}>{g.grupo}</div>
            {g.itens.map(item=>{
              const v=itens[item.id]||{on:false,qty:"",op:"",val:""};
              return(
                <div key={item.id} style={{borderTop:"1px solid #111d2a",background:v.on?"#0f2235":C.card,transition:"background .15s"}}>
                  <div onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 13px",cursor:"pointer"}}>
                    <div style={{width:22,height:22,borderRadius:6,flexShrink:0,border:v.on?`2px solid ${C.orange}`:"2px solid #2a3f54",background:v.on?C.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                      {v.on&&<IcoCheck s={13}/>}
                    </div>
                    <span style={{fontSize:14,color:v.on?C.text:"#6a8a9a",fontWeight:v.on?600:400,flex:1}}>{item.label}</span>
                  </div>
                  {v.on&&item.t==="q"&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"2px 13px 12px 47px"}}>
                      <span style={{fontSize:12,color:C.muted}}>Quantidade:</span>
                      <input type="number" min="1" placeholder="0" value={v.qty} onClick={e=>e.stopPropagation()} onChange={e=>upd(item.id,{qty:e.target.value})} style={{...sm,width:72,textAlign:"center"}}/>
                      <span style={{fontSize:12,color:C.muted}}>unid.</span>
                    </div>
                  )}
                  {v.on&&item.t==="op"&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"2px 13px 12px 47px"}}>
                      <span style={{fontSize:12,color:C.muted,flexShrink:0}}>Tipo:</span>
                      <select value={v.op} onClick={e=>e.stopPropagation()} onChange={e=>upd(item.id,{op:e.target.value})} style={{...sm,flex:1}}>
                        <option value="">Selecione...</option>
                        {item.ops.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  )}
                  {v.on&&item.t==="v"&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"2px 13px 12px 47px"}}>
                      <span style={{fontSize:12,color:C.muted}}>Medida:</span>
                      <input type="number" step="0.5" placeholder={item.placeholder||"0"} value={v.val} onClick={e=>e.stopPropagation()} onChange={e=>upd(item.id,{val:e.target.value})} style={{...sm,width:80,textAlign:"center"}}/>
                      <span style={{fontSize:12,color:C.muted}}>pol.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {total>0&&<div style={{marginTop:8,padding:"7px 11px",background:"#0a1f10",border:"1px solid #1a3a20",borderRadius:8,fontSize:12,color:C.green,display:"flex",alignItems:"center",gap:6}}><IcoCheck s={13}/> {total} servico{total>1?"s":""} selecionado{total>1?"s":""}</div>}
    </div>
  );
}

function ChecklistPeneira({equipCodigo, itens, onChange}) {
  const cfgKey = Object.keys(PEN_CONFIG).find(k=>equipCodigo===k||equipCodigo==="PEN0"+k.slice(-1));
  const cfg = PEN_CONFIG[equipCodigo] || PEN_CONFIG[cfgKey];
  if(!cfg) return null;
  const deckGrupo = {grupo:"Troca de Telas", itens:cfg.decks.map(d=>({id:d.id,label:d.label+"  -  "+d.info,t:"q"}))};
  const allGrupos = [deckGrupo,...PEN_GRUPOS_FIXOS];
  return(
    <div>
      <div style={{marginBottom:8,padding:"7px 11px",background:"#0d1e2e",borderRadius:8,fontSize:12,color:"#5a8a9a",display:"flex",gap:6,alignItems:"center"}}>
        <span style={{color:C.orange,fontWeight:800}}>{cfg.nome}</span><span> - </span><span>{cfg.material}</span>
      </div>
      <ChecklistGrupos grupos={allGrupos} itens={itens} onChange={onChange}/>
    </div>
  );
}


// -- CATEGORY ICONS --
function CatIcon({tipo, ativo}) {
  const cor = ativo ? "#FF6B2B" : "#4a6a7a";
  const s = 38;
  const icons = {
    "Transportadora de Correia": (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        {/* Estrutura da transportadora */}
        <rect x="4" y="28" width="56" height="8" rx="4" stroke={cor} strokeWidth="2.5" fill="none"/>
        {/* Roletes */}
        <circle cx="12" cy="32" r="5" stroke={cor} strokeWidth="2.5" fill="none"/>
        <circle cx="32" cy="32" r="5" stroke={cor} strokeWidth="2.5" fill="none"/>
        <circle cx="52" cy="32" r="5" stroke={cor} strokeWidth="2.5" fill="none"/>
        {/* Correia superior */}
        <line x1="4" y1="24" x2="60" y2="24" stroke={cor} strokeWidth="2" strokeDasharray="4 2"/>
        {/* Suporte */}
        <line x1="12" y1="37" x2="10" y2="50" stroke={cor} strokeWidth="2"/>
        <line x1="52" y1="37" x2="54" y2="50" stroke={cor} strokeWidth="2"/>
        <line x1="8" y1="50" x2="56" y2="50" stroke={cor} strokeWidth="2"/>
        {/* Material em cima */}
        <path d="M20 24 L28 16 L36 16 L44 24" stroke={cor} strokeWidth="2" fill={ativo?cor+"33":"none"}/>
      </svg>
    ),
    "Britador Conico": (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        {/* Corpo conico */}
        <path d="M20 8 L44 8 L52 48 L12 48 Z" stroke={cor} strokeWidth="2.5" fill={ativo?cor+"22":"none"}/>
        {/* Cabeca interna */}
        <path d="M26 18 L38 18 L42 44 L22 44 Z" stroke={cor} strokeWidth="2" fill={ativo?cor+"11":"none"}/>
        {/* Anel superior */}
        <rect x="18" y="6" width="28" height="5" rx="2" stroke={cor} strokeWidth="2" fill="none"/>
        {/* Base */}
        <rect x="10" y="48" width="44" height="6" rx="2" stroke={cor} strokeWidth="2" fill="none"/>
        {/* Eixo */}
        <line x1="32" y1="8" x2="32" y2="48" stroke={cor} strokeWidth="1.5" strokeDasharray="3 2"/>
      </svg>
    ),
    "Britador de Mandibula": (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        {/* Chassi */}
        <rect x="8" y="6" width="48" height="52" rx="4" stroke={cor} strokeWidth="2.5" fill="none"/>
        {/* Mandibula fixa */}
        <path d="M14 12 L50 12 L50 38 L14 22 Z" stroke={cor} strokeWidth="2" fill={ativo?cor+"22":"none"}/>
        {/* Mandibula movel */}
        <path d="M14 52 L50 52 L50 42 L14 42 Z" stroke={cor} strokeWidth="2" fill={ativo?cor+"22":"none"}/>
        {/* Abertura */}
        <path d="M14 22 L50 38 L50 42 L14 42" stroke={cor} strokeWidth="1.5" strokeDasharray="3 2" fill="none"/>
        {/* Volante */}
        <circle cx="52" cy="28" r="7" stroke={cor} strokeWidth="2" fill="none"/>
        <line x1="52" y1="21" x2="52" y2="35" stroke={cor} strokeWidth="1.5"/>
        <line x1="45" y1="28" x2="59" y2="28" stroke={cor} strokeWidth="1.5"/>
      </svg>
    ),
    "Peneira de Separacao": (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        {/* Caixa inclinada */}
        <path d="M6 18 L58 10 L58 50 L6 58 Z" stroke={cor} strokeWidth="2.5" fill="none"/>
        {/* Telas / malhas */}
        <line x1="6" y1="28" x2="58" y2="21" stroke={cor} strokeWidth="1.5"/>
        <line x1="6" y1="38" x2="58" y2="31" stroke={cor} strokeWidth="1.5"/>
        <line x1="6" y1="48" x2="58" y2="41" stroke={cor} strokeWidth="1.5"/>
        {/* Verticais da malha */}
        <line x1="20" y1="18" x2="18" y2="58" stroke={cor} strokeWidth="1" strokeDasharray="2 3"/>
        <line x1="34" y1="15" x2="32" y2="55" stroke={cor} strokeWidth="1" strokeDasharray="2 3"/>
        <line x1="48" y1="12" x2="46" y2="52" stroke={cor} strokeWidth="1" strokeDasharray="2 3"/>
        {/* Molas */}
        <path d="M6 18 Q2 28 6 38 Q2 48 6 58" stroke={cor} strokeWidth="2" fill="none"/>
        <path d="M58 10 Q62 20 58 30 Q62 40 58 50" stroke={cor} strokeWidth="2" fill="none"/>
      </svg>
    ),
    "Alimentador": (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        {/* Calha */}
        <path d="M8 20 L56 20 L52 50 L12 50 Z" stroke={cor} strokeWidth="2.5" fill={ativo?cor+"22":"none"}/>
        {/* Vibrador */}
        <rect x="22" y="10" width="20" height="10" rx="3" stroke={cor} strokeWidth="2" fill="none"/>
        <line x1="32" y1="10" x2="32" y2="20" stroke={cor} strokeWidth="2"/>
        {/* Setas de vibracao */}
        <path d="M18 30 L14 34 L18 38" stroke={cor} strokeWidth="2" fill="none"/>
        <path d="M46 30 L50 34 L46 38" stroke={cor} strokeWidth="2" fill="none"/>
        {/* Material saindo */}
        <path d="M26 50 L24 58 M32 50 L32 58 M38 50 L40 58" stroke={cor} strokeWidth="2"/>
      </svg>
    ),
    "Outro": (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="12" stroke={cor} strokeWidth="2.5" fill="none"/>
        <path d="M32 20 L32 8M32 56 L32 44M44 32 L56 32M8 32 L20 32" stroke={cor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M40.5 23.5 L48.5 15.5M15.5 48.5 L23.5 40.5M40.5 40.5 L48.5 48.5M15.5 15.5 L23.5 23.5" stroke={cor} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  };
  return <div style={{display:"flex",justifyContent:"center"}}>{icons[tipo]||icons["Outro"]}</div>;
}


// -- SELETOR TIPO REGISTRO --
function SeletorTipo({tipo, onChange}) {
  const tipos = [
    {id:"manutencao", label:"Manutencao", cor:"#FF6B2B", icon:"M"},
    {id:"inspecao",   label:"Inspecao",   cor:"#2E75B6", icon:"I"},
    {id:"os",         label:"Ordem de Servico", cor:"#a855f7", icon:"OS"},
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
      {tipos.map(t=>(
        <div key={t.id} onClick={()=>onChange(t.id)} style={{
          padding:"12px 6px", borderRadius:12, textAlign:"center", cursor:"pointer",
          background: tipo===t.id ? t.cor+"22" : "#0a1520",
          border: "1.5px solid "+(tipo===t.id ? t.cor : "#1e3044"),
          transition:"all .15s",
        }}>
          <div style={{fontSize:16,fontWeight:900,color:tipo===t.id?t.cor:"#4a6a7a",marginBottom:3}}>{t.icon}</div>
          <div style={{fontSize:10,fontWeight:700,color:tipo===t.id?t.cor:"#4a6a7a",lineHeight:1.3}}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

// -- ORDEM DE SERVICO FORM --
function FormInspecao({user, records, setRecords, onBack}) {
  const blank = () => ({equipamento:"",inspector:user.nome||"",inicio:new Date().toISOString().slice(0,16),horimetro:"",resultado:"Conforme",observacoes:"",itens:{}});
  const [f, setF] = useState(blank());
  const [st, setSt] = useState("idle");
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const eq = DEMO_EQUIPS.find(e=>e.id===f.equipamento);
  const valid = f.equipamento && f.inspector && f.inicio;
  const GRUPOS_E = ["Transportadora de Correia","Britador Conico","Britador de Mandibula","Peneira de Separacao","Alimentador","Outro"];
  const resCores = {"Conforme":"#22C55E","Atencao":"#F59E0B","Nao Conforme":"#ef4444"};
  const toggleItem = (item,val) => setF(p=>({...p,itens:{...p.itens,[item]:val}}));

  // Usa o mesmo checklist da manutencao baseado no tipo do equipamento
  const getGrupos = () => {
    if(!eq) return [];
    if(eq.tipo==="Transportadora de Correia") return TC_GRUPOS;
    if(eq.tipo==="Britador Conico") {
      if(eq.codigo==="HP400-1"||eq.codigo==="HP400-2") return BRT_GRUPOS.HP400;
      return BRT_GRUPOS.PatriotCone||BRT_GRUPOS.HP400;
    }
    if(eq.tipo==="Britador de Mandibula") return BRT_GRUPOS.C125||BRT_GRUPOS.LibertyJaw;
    if(eq.tipo==="Peneira de Separacao") {
      const cfg = PEN_CONFIG[eq.codigo];
      if(cfg) {
        const deckGrupo = {grupo:"Troca de Telas", itens:cfg.decks.map(d=>({id:d.id,label:d.label+" - "+d.info,t:"c"}))};
        return [deckGrupo,...PEN_GRUPOS_FIXOS];
      }
    }
    return [];
  };
  const grupos = getGrupos();
  const salvar = () => {
    if(!valid) return; setSt("saving");
    const nova = {...f,id:uid(),tipo:"inspecao",criadoEm:new Date().toISOString(),eq_nome:eq?.nome,eq_codigo:eq?.codigo,eq_tipo:eq?.tipo,pedreira_id:user.pedreira_id,pedreira_nome:user.pedreira_nome,operador:f.inspector,status:f.resultado,tipoManutencao:"Inspecao"};
    setRecords(prev=>[nova,...prev]); setSt("ok");
    setTimeout(()=>{ onBack(); },1600);
  };
  return(
    <div style={{paddingBottom:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={onBack} style={{padding:"8px 12px",borderRadius:8,border:"1.5px solid #1e3044",background:"transparent",color:"#6a8a9a",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Voltar</button>
        <div style={{fontSize:16,fontWeight:800,color:"#deeaf5"}}>Registro de Inspecao</div>
      </div>
      <Fld label="Equipamento *">
        <select style={C.input} value={f.equipamento} onChange={e=>set("equipamento",e.target.value)}>
          <option value="">Selecione o equipamento...</option>
          {GRUPOS_E.map(g=>(<optgroup key={g} label={g}>{DEMO_EQUIPS.filter(e=>e.tipo===g).map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</optgroup>))}
        </select>
        {eq&&<div style={{marginTop:6,padding:"6px 11px",background:"#0d1e2e",borderRadius:8,fontSize:12,color:"#5a8a9a"}}><span style={{color:"#FF6B2B",fontWeight:800}}>{eq.codigo}</span> - {eq.nome}</div>}
      </Fld>
      <Fld label="Inspetor *"><input style={C.input} value={f.inspector} onChange={e=>set("inspector",e.target.value)}/></Fld>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Fld label="Data / Hora *"><input type="datetime-local" style={C.input} value={f.inicio} onChange={e=>set("inicio",e.target.value)}/></Fld>
        <Fld label="Horimetro (h)"><input type="number" style={C.input} placeholder="Ex: 4523" value={f.horimetro} onChange={e=>set("horimetro",e.target.value)}/></Fld>
      </div>
      {grupos.length>0&&(
        <div style={{marginBottom:14}}>
          <Lbl t="Itens Inspecionados"/>
          {grupos.map(g=>(
            <div key={g.grupo} style={{marginBottom:8,borderRadius:12,border:"1.5px solid #1e3044",overflow:"hidden"}}>
              <div style={{padding:"7px 13px",background:"#0d1e2e",fontSize:10,fontWeight:800,color:"#FF6B2B",letterSpacing:1,textTransform:"uppercase"}}>{g.grupo}</div>
              {g.itens.map((item,i)=>(
                <div key={item.id} style={{borderTop:"1px solid #111d2a",padding:"9px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",background:i%2===0?"#091420":"#0a1520"}}>
                  <span style={{fontSize:12,color:"#deeaf5",flex:1,marginRight:8}}>{item.label}</span>
                  <div style={{display:"flex",gap:5}}>
                    {["OK","X","N/A"].map(v=>(
                      <button key={v} onClick={()=>toggleItem(item.id,v)} style={{width:30,height:26,borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:f.itens[item.id]===v?(v==="OK"?"#22C55E":v==="X"?"#ef4444":"#F59E0B")+"33":"transparent",border:"1.5px solid "+(f.itens[item.id]===v?(v==="OK"?"#22C55E":v==="X"?"#ef4444":"#F59E0B"):"#1e3044"),color:f.itens[item.id]===v?(v==="OK"?"#22C55E":v==="X"?"#ef4444":"#F59E0B"):"#4a6a7a"}}>{v}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {grupos.length===0&&f.equipamento&&(
        <div style={{padding:"12px",background:"#0d1e2e",borderRadius:10,marginBottom:14,fontSize:13,color:"#4a6a7a",textAlign:"center"}}>
          Selecione um equipamento para ver os itens de inspecao
        </div>
      )}
      <div style={{marginBottom:14}}>
        <Lbl t="Resultado Geral"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {["Conforme","Atencao","Nao Conforme"].map(r=>(
            <div key={r} onClick={()=>set("resultado",r)} style={{padding:"10px 4px",borderRadius:10,textAlign:"center",cursor:"pointer",background:f.resultado===r?resCores[r]+"33":"#0a1520",border:"1.5px solid "+(f.resultado===r?resCores[r]:"#1e3044")}}>
              <div style={{fontSize:11,fontWeight:700,color:f.resultado===r?resCores[r]:"#4a6a7a"}}>{r}</div>
            </div>
          ))}
        </div>
      </div>
      <Fld label="Observacoes / Anomalias">
        <textarea style={{...C.input,minHeight:80,resize:"vertical"}} placeholder="Descreva anomalias encontradas..." value={f.observacoes} onChange={e=>set("observacoes",e.target.value)}/>
      </Fld>
      <Btn onClick={salvar} disabled={!valid||st==="saving"} full color={st==="ok"?"#22C55E":"#2E75B6"}>
        {st==="saving"&&<Spin/>}{st==="ok"&&<IcoCheck s={16}/>}
        {st==="saving"?"Salvando...":st==="ok"?"Inspecao Registrada!":"Registrar Inspecao"}
      </Btn>
    </div>
  );
}

function FormOS({user, ordens, setOrdens, onBack}) {
  const [f, setF] = useState({
    equipamento:"", tipo:"Corretiva", prioridade:"Media",
    descricao:"", tecnico:user.nome||"", dataPrevisao:"",
    pecas:"", observacoes:"", status:"Solicitada",
  });
  const [st, setSt] = useState("idle");
  const [categoria, setCategoria] = useState("");
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const eq = DEMO_EQUIPS.find(e=>e.id===f.equipamento);
  const equipsCategoria = DEMO_EQUIPS.filter(e=>e.tipo===categoria);
  const valid = f.equipamento && f.descricao && f.tecnico;
  const priorCores = {"Baixa":"#22C55E","Media":"#F59E0B","Alta":"#FF6B2B","Emergencia":"#ef4444"};
  const GRUPOS_E = ["Transportadora de Correia","Britador Conico","Britador de Mandibula","Peneira de Separacao","Alimentador","Outro"];

  const salvar = () => {
    if(!valid) return;
    setSt("saving");
    const nova = {
      ...f, id:uid(), criadoEm:new Date().toISOString(),
      criadoPor:user.nome, pedreira_id:user.pedreira_id,
      pedreira_nome:user.pedreira_nome,
      eq_nome:eq?.nome, eq_codigo:eq?.codigo,
      numero:"OS-"+Date.now().toString(36).toUpperCase().slice(-6),
    };
    setOrdens(prev=>[nova,...prev]);
    setSt("ok");
    setTimeout(()=>{ onBack(); },1600);
  };

  return(
    <div style={{paddingBottom:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={onBack} style={{padding:"8px 12px",borderRadius:8,border:"1.5px solid #1e3044",background:"transparent",color:"#6a8a9a",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
          Voltar
        </button>
        <div style={{fontSize:16,fontWeight:800,color:"#deeaf5"}}>Nova Ordem de Servico</div>
      </div>

      <div style={{marginBottom:14}}>
        <Lbl t="Prioridade *"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {["Baixa","Media","Alta","Emergencia"].map(p=>(
            <div key={p} onClick={()=>set("prioridade",p)} style={{
              padding:"9px 4px",borderRadius:10,textAlign:"center",cursor:"pointer",
              background:f.prioridade===p?priorCores[p]+"33":"#0a1520",
              border:"1.5px solid "+(f.prioridade===p?priorCores[p]:"#1e3044"),
            }}>
              <div style={{fontSize:11,fontWeight:700,color:f.prioridade===p?priorCores[p]:"#4a6a7a"}}>{p}</div>
            </div>
          ))}
        </div>
      </div>

      <Fld label="Equipamento *">
        <select style={C.input} value={f.equipamento} onChange={e=>set("equipamento",e.target.value)}>
          <option value="">Selecione...</option>
          {GRUPOS_E.map(g=>(
            <optgroup key={g} label={g}>
              {DEMO_EQUIPS.filter(e=>e.tipo===g).map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}
            </optgroup>
          ))}
        </select>
        {eq&&<div style={{marginTop:6,padding:"6px 11px",background:"#0d1e2e",borderRadius:8,fontSize:12,color:"#5a8a9a"}}><span style={{color:"#FF6B2B",fontWeight:800}}>{eq.codigo}</span> - {eq.nome}</div>}
      </Fld>

      <Fld label="Tipo de Servico">
        <select style={C.input} value={f.tipo} onChange={e=>set("tipo",e.target.value)}>
          {["Corretiva","Preventiva","Preditiva","Inspecao","Emergencia","Melhoria"].map(t=><option key={t}>{t}</option>)}
        </select>
      </Fld>

      <Fld label="Descricao do Servico *">
        <textarea style={{...C.input,minHeight:90,resize:"vertical"}} placeholder="Descreva o servico necessario..." value={f.descricao} onChange={e=>set("descricao",e.target.value)}/>
      </Fld>

      <Fld label="Tecnico Responsavel *">
        <input style={C.input} value={f.tecnico} onChange={e=>set("tecnico",e.target.value)}/>
      </Fld>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Fld label="Data Prevista">
          <input type="datetime-local" style={C.input} value={f.dataPrevisao} onChange={e=>set("dataPrevisao",e.target.value)}/>
        </Fld>
        <Fld label="Status">
          <select style={C.input} value={f.status} onChange={e=>set("status",e.target.value)}>
            {["Solicitada","Programada","Em andamento","Concluida"].map(s=><option key={s}>{s}</option>)}
          </select>
        </Fld>
      </div>

      <Fld label="Pecas / Materiais Necessarios">
        <textarea style={{...C.input,minHeight:60,resize:"vertical"}} placeholder="Liste as pecas necessarias..." value={f.pecas} onChange={e=>set("pecas",e.target.value)}/>
      </Fld>

      <Fld label="Observacoes">
        <textarea style={{...C.input,minHeight:60,resize:"vertical"}} placeholder="Informacoes adicionais..." value={f.observacoes} onChange={e=>set("observacoes",e.target.value)}/>
      </Fld>

      <Btn onClick={salvar} disabled={!valid||st==="saving"} full color={st==="ok"?"#a855f7":"#FF6B2B"}>
        {st==="saving"&&<Spin/>}{st==="ok"&&<IcoCheck s={16}/>}
        {st==="saving"?"Salvando...":st==="ok"?"OS Aberta!":"Abrir Ordem de Servico"}
      </Btn>
    </div>
  );
}

// -- OS CARD --
function OSCard({os, onUpdate, isManager}) {
  const eq = DEMO_EQUIPS.find(e=>e.id===os.equipamento);
  const STATUS_CORES = {"Solicitada":"#a855f7","Programada":"#2E75B6","Em andamento":"#FF6B2B","Concluida":"#22C55E"};
  const PRIOR_CORES  = {"Baixa":"#22C55E","Media":"#F59E0B","Alta":"#FF6B2B","Emergencia":"#ef4444"};
  const cor = STATUS_CORES[os.status]||"#7a9bb5";
  const pc  = PRIOR_CORES[os.prioridade]||"#7a9bb5";
  const fmtDT = iso => iso ? new Date(iso).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) : "--";

  return(
    <div style={{background:"#0a1520",borderRadius:14,padding:15,marginBottom:12,border:"1.5px solid "+(os.prioridade==="Emergencia"?"#ef444444":"#172535"),position:"relative",overflow:"hidden"}}>
      {os.prioridade==="Emergencia"&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#ef4444,transparent)"}}/>}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:800,color:"#a855f7"}}>{os.numero}</span>
            <span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:20,background:cor+"22",color:cor,border:"1px solid "+cor+"44"}}>{os.status}</span>
            <span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:20,background:pc+"22",color:pc,border:"1px solid "+pc+"44"}}>{os.prioridade}</span>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:"#deeaf5"}}>{eq?.nome||os.equipamento}</div>
          <div style={{fontSize:12,color:"#4a6a7a",marginTop:2}}>{os.tipo}</div>
        </div>
      </div>
      <div style={{padding:"8px 10px",background:"#091420",borderRadius:8,fontSize:12,color:"#deeaf5",marginBottom:8}}>{os.descricao}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Kv l="TECNICO"  v={os.tecnico}/>
        <Kv l="ABERTURA" v={fmtDT(os.criadoEm)}/>
        <Kv l="PREVISAO" v={os.dataPrevisao?fmtDT(os.dataPrevisao):"Nao definida"}/>
        <Kv l="SOLICITADO" v={os.criadoPor}/>
      </div>
      {os.pecas&&<div style={{padding:"6px 10px",background:"#0a1f10",border:"1px solid #1a3a20",borderRadius:8,fontSize:12,color:"#22C55E",marginBottom:8}}>Pecas: {os.pecas}</div>}
      {isManager&&(
        <div style={{marginTop:10}}>
          <Lbl t="Atualizar Status"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["Solicitada","Programada","Em andamento","Concluida"].map(s=>(
              <button key={s} onClick={()=>onUpdate(os.id,s)} style={{
                padding:"6px 10px",borderRadius:8,fontSize:11,fontWeight:700,
                cursor:"pointer",fontFamily:"inherit",
                background:os.status===s?(STATUS_CORES[s]||"#7a9bb5")+"33":"transparent",
                border:"1.5px solid "+(os.status===s?(STATUS_CORES[s]||"#7a9bb5"):"#1e3044"),
                color:os.status===s?(STATUS_CORES[s]||"#7a9bb5"):"#4a6a7a",
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OperadorForm({user, records, setRecords}) {
  const blank = () => ({equipamento:"",tipoManutencao:"",tcItens:{},penItens:{},brtItens:{},operador:user.nome||"",inicio:new Date().toISOString().slice(0,16),fim:"",horimetro:"",observacoes:"",status:"Em Andamento"});
  const [f, setF] = useState(blank());
  const [fotos, setFotos] = useState([]);
  const [st, setSt] = useState("idle");
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const eq = DEMO_EQUIPS.find(e=>e.id===f.equipamento);
  const isTC  = eq?.tipo==="Transportadora de Correia";
  const isPEN = eq?.tipo==="Peneira de Separacao";
  const isBRT = eq?.tipo==="Britador Conico"||eq?.tipo==="Britador de Mandibula";
  const nTC  = Object.values(f.tcItens).filter(v=>v.on).length;
  const nPEN = Object.values(f.penItens).filter(v=>v.on).length;
  const nBRT = Object.values(f.brtItens).filter(v=>v.on).length;
  const valid = f.equipamento&&f.operador&&f.inicio&&(isTC?nTC>0:isPEN?nPEN>0:isBRT?nBRT>0:f.tipoManutencao!=="");

  const getBrtGrupos = () => {
    if(eq?.codigo==="C125"||eq?.codigo==="BR-01") return BRT_GRUPOS.C125;
    if(eq?.codigo==="HP400-1"||eq?.codigo==="HP400-2") return BRT_GRUPOS.HP400;
    if(eq?.codigo==="BR-02"||eq?.codigo==="BR-03") return BRT_GRUPOS.PatriotCone;
    if(eq?.tipo==="Britador de Mandibula") return BRT_GRUPOS.LibertyJaw;
    if(eq?.tipo==="Britador Conico") return BRT_GRUPOS.PatriotCone;
    return BRT_GRUPOS.HP400;
  };

  const save = async () => {
    if(!valid) return;
    setSt("saving");
    const novo = {...f, id:uid(), criadoEm:new Date().toISOString(), pedreira_id:user.pedreira_id, pedreira_nome:user.pedreira_nome, eq_nome:eq?.nome, eq_codigo:eq?.codigo, eq_tipo:eq?.tipo, fotos:fotos};
    const next = [novo,...records];
    setRecords(next);
    try { await sb.post("manutencoes", novo); } catch {}
    setSt("ok");
    setTimeout(()=>{ setF(blank()); setFotos([]); setSt("idle"); },1600);
  };

  const CATEGORIAS = [
    { tipo:"Transportadora de Correia", label:"Transportadoras",   icon:"TC" },
    { tipo:"Britador Conico",           label:"Brit. Conico",      icon:"BC" },
    { tipo:"Britador de Mandibula",     label:"Brit. Mandibula",   icon:"BM" },
    { tipo:"Peneira de Separacao",      label:"Peneiras",          icon:"PN" },
    { tipo:"Alimentador",               label:"Alimentadores",     icon:"AL" },
    { tipo:"Outro",                     label:"Outros",            icon:"OT" },
  ];

  const [categoria, setCategoria] = useState("");
  const equipsCategoria = DEMO_EQUIPS.filter(e=>e.tipo===categoria);

  const selecionarCategoria = (tipo) => {
    setCategoria(tipo);
    set("equipamento","");
    set("tcItens",{});
    set("penItens",{});
    set("brtItens",{});
    set("tipoManutencao","");
  };

  return(
    <div style={{paddingBottom:100}}>

      {/* STEP 1  -  Categoria */}
      <div style={{marginBottom:16}}>
        <Lbl t="1. Selecione a Categoria *"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {CATEGORIAS.filter(cat=>DEMO_EQUIPS.some(e=>e.tipo===cat.tipo)).map(cat=>(
            <div
              key={cat.tipo}
              onClick={()=>selecionarCategoria(cat.tipo)}
              style={{
                background: categoria===cat.tipo ? C.orange+"22" : C.card,
                border: `1.5px solid ${categoria===cat.tipo ? C.orange : C.border}`,
                borderRadius:12, padding:"12px 8px",
                textAlign:"center", cursor:"pointer",
                transition:"all .15s",
              }}
            >
              <CatIcon tipo={cat.tipo} ativo={categoria===cat.tipo}/>
              <div style={{fontSize:11,fontWeight:700,color:categoria===cat.tipo?C.orange:C.muted,lineHeight:1.2,marginTop:5}}>{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 2  -  Equipamento */}
      {categoria && (
        <div style={{marginBottom:16,animation:"fadeUp .2s ease"}}>
          <Lbl t="2. Selecione o Equipamento *"/>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {equipsCategoria.map(e=>(
              <div
                key={e.id}
                onClick={()=>{set("equipamento",e.id);set("tcItens",{});set("penItens",{});set("brtItens",{});set("tipoManutencao","");}}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 14px", borderRadius:11,
                  background: f.equipamento===e.id ? C.orange+"22" : C.card,
                  border:`1.5px solid ${f.equipamento===e.id ? C.orange : C.border}`,
                  cursor:"pointer", transition:"all .15s",
                }}
              >
                <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${f.equipamento===e.id?C.orange:"#2a3f54"}`,background:f.equipamento===e.id?C.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  {f.equipamento===e.id&&<IcoCheck s={11}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:f.equipamento===e.id?C.text:"#7a9aaa"}}>{e.nome}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{e.codigo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info do equipamento selecionado */}
      {eq&&<div style={{marginBottom:10,padding:"8px 12px",background:"#0d1e2e",borderRadius:8,fontSize:12,color:"#5a8a9a",display:"flex",gap:7,alignItems:"center"}}><span style={{color:C.orange,fontWeight:800}}>{eq.codigo}</span><span> - </span><span style={{color:C.text,fontWeight:600}}>{eq.nome}</span></div>}

      {/* Alerta de horimetro para britadores conicos */}
      {eq&&eq.tipo==="Britador Conico"&&(()=>{
        try {
          const cfg = JSON.parse(localStorage.getItem("maintenpro_alertas_v1")||"{}")[eq.id];
          if(!cfg) return null;
          const recsEq = records.filter(r=>(r.eq_codigo===eq.id||r.equipamento===eq.id)&&r.horimetro).sort((a,b)=>new Date(b.criadoEm)-new Date(a.criadoEm));
          if(!recsEq.length) return null;
          const ultimoH = parseFloat(recsEq[0].horimetro)||0;
          const ultimaTroca = records.filter(r=>(r.eq_codigo===eq.id||r.equipamento===eq.id)&&r.horimetro&&(r.brtItens?.["hp_m1"]?.on||r.brtItens?.["hp_m2"]?.on||r.brtItens?.["pa_m1"]?.on||r.brtItens?.["pa_m2"]?.on)).sort((a,b)=>new Date(b.criadoEm)-new Date(a.criadoEm));
          const hTroca = ultimaTroca.length?parseFloat(ultimaTroca[0].horimetro)||0:0;
          const faltam = cfg.intervalo-(ultimoH-hTroca);
          if(faltam>cfg.aviso) return null;
          const vencido = faltam<=0;
          const cor = vencido?"#ef4444":C.yellow;
          return(
            <div style={{display:"flex",gap:8,padding:"10px 13px",background:cor+"18",border:`1.5px solid ${cor}44`,borderRadius:10,marginBottom:12,alignItems:"center"}}>
              <IcoAlert s={16}/>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:cor}}>
                  {vencido?`! REVESTIMENTO VENCIDO! ${Math.abs(Math.round(faltam))}h em atraso`:`! Trocar revestimento em ${Math.round(faltam)}h`}
                </div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Manto e côncavo  -  verificar na gerência</div>
              </div>
            </div>
          );
        } catch { return null; }
      })()}

      {isTC&&<ChecklistGrupos grupos={TC_GRUPOS} itens={f.tcItens} onChange={v=>set("tcItens",v)}/>}
      {isPEN&&<ChecklistPeneira equipCodigo={eq?.codigo} itens={f.penItens} onChange={v=>set("penItens",v)}/>}
      {isBRT&&<ChecklistGrupos grupos={getBrtGrupos()} itens={f.brtItens} onChange={v=>set("brtItens",v)}/>}
      {!isTC&&!isPEN&&!isBRT&&f.equipamento&&(
        <Fld label="Tipo de Manutencao *">
          <select style={C.input} value={f.tipoManutencao} onChange={e=>set("tipoManutencao",e.target.value)}>
            <option value="">Selecione o tipo...</option>
            {TIPOS_MANUT.map(t=><option key={t}>{t}</option>)}
          </select>
        </Fld>
      )}

      <Fld label="Operador / Tecnico *">
        <input style={C.input} placeholder="Nome do responsavel" value={f.operador} onChange={e=>set("operador",e.target.value)}/>
      </Fld>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Fld label="Inicio *"><input type="datetime-local" style={C.input} value={f.inicio} onChange={e=>set("inicio",e.target.value)}/></Fld>
        <Fld label="Fim"><input type="datetime-local" style={C.input} value={f.fim} onChange={e=>set("fim",e.target.value)}/></Fld>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Fld label="Horimetro (h)"><input type="number" style={C.input} placeholder="Ex: 4523" value={f.horimetro} onChange={e=>set("horimetro",e.target.value)}/></Fld>
        <Fld label="Status">
          <select style={C.input} value={f.status} onChange={e=>set("status",e.target.value)}>
            {Object.keys(COR_ST).map(s=><option key={s}>{s}</option>)}
          </select>
        </Fld>
      </div>
      <FotoUpload fotos={fotos} onChange={setFotos}/>

      <Fld label="Observacoes">
        <textarea style={{...C.input,minHeight:75,resize:"vertical"}} placeholder="Observacoes, pecas trocadas, alertas..." value={f.observacoes} onChange={e=>set("observacoes",e.target.value)}/>
      </Fld>
      {!valid&&f.equipamento&&(
        <div style={{display:"flex",gap:8,padding:"9px 12px",background:"#16100a",border:"1px solid #3a2808",borderRadius:10,marginBottom:12,alignItems:"center"}}>
          <IcoAlert s={14}/><span style={{fontSize:13,color:C.yellow}}>{(isTC&&nTC===0)||(isPEN&&nPEN===0)||(isBRT&&nBRT===0)?"Selecione pelo menos um servico.":"Preencha os campos obrigatorios (*)"}</span>
        </div>
      )}
      <Btn onClick={save} disabled={!valid||st==="saving"} full color={st==="ok"?C.green:C.orange}>
        {st==="saving"&&<Spin/>}{st==="ok"&&<IcoCheck s={16}/>}
        {st==="saving"?"Registrando...":st==="ok"?"Registrado com Sucesso!":"Registrar Manutencao"}
      </Btn>
    </div>
  );
}

// ===========================================================
// MANUTENCAO CARD
// ===========================================================
function ManutCard({rec, onFinish, onDelete}) {
  const cor = COR_ST[rec.status]||C.orange;
  const ativo = rec.status==="Em Andamento";
  const [dur,setDur] = useState(()=>fmtD(rec.inicio,rec.fim||undefined));
  useEffect(()=>{ if(!ativo)return; const t=setInterval(()=>setDur(fmtD(rec.inicio)),15000); return()=>clearInterval(t); },[ativo,rec.inicio]);

  return(
    <Card style={{marginBottom:12,position:"relative",overflow:"hidden",border:`1.5px solid ${ativo?C.orange+"33":C.border}`}}>
      {ativo&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.orange},transparent)`}}/>}
      <div style={{display:"flex",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:11,fontWeight:800,color:C.orange}}>{rec.eq_codigo||rec.equipamento}</span>
            <Tag label={rec.status} color={cor}/>
            {rec.pedreira_nome&&<Tag label={rec.pedreira_nome} color="#5a7a8a"/>}
          </div>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{rec.eq_nome||rec.equipamento}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{rec.tipoManutencao}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <Kv l="TECNICO" v={rec.operador}/>
        <Kv l={rec.fim?"FIM":"DURACAO"} v={rec.fim?fmtT(rec.fim):dur} hi={ativo}/>
        <Kv l="INICIO" v={fmtT(rec.inicio)}/>
        {rec.horimetro&&<Kv l="HORIMETRO" v={rec.horimetro+" h"}/>}
      </div>
      {rec.observacoes&&<div style={{padding:"7px 10px",background:"#130f05",border:"1px solid #352508",borderRadius:8,fontSize:12,color:C.yellow,marginBottom:10,display:"flex",gap:6}}><IcoAlert s={13}/><span>{rec.observacoes}</span></div>}

      {rec.fotos&&rec.fotos.length>0&&(
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"#3a5a6a",letterSpacing:.5,marginBottom:6}}>FOTOS DO SERVIÇO ({rec.fotos.length})</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {rec.fotos.map(foto=>(
              <div key={foto.id} style={{borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
                <img src={foto.url} alt={foto.nome} style={{width:"100%",height:80,objectFit:"cover",display:"block"}}
                  onClick={()=>window.open(foto.url,"_blank")}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {ativo&&onFinish&&<Btn onClick={()=>onFinish(rec)} color={C.green} sm full><IcoCheck s={14}/> Finalizar</Btn>}
        {onDelete&&<Btn onClick={()=>onDelete(rec.id)} outline color="#ef4444" sm><IcoTrash s={14}/></Btn>}
      </div>
    </Card>
  );
}

// ===========================================================
// DASHBOARD GERENCIA / ADMIN
// ===========================================================
function Dashboard({records, setRecords, ordens=[], setOrdens=()=>{}, user}) {
  const now = new Date();
  const [aba, setAba]         = useState("graficos");
  const [periodo, setPeriodo] = useState("mes");
  const [eqFiltro, setEqFiltro] = useState("");
  const [fs, setFs]           = useState({q:"",status:""});
  const [eqDetalhe, setEqDetalhe] = useState(null);

  // -- Alertas de Horimetro --
  const SK_ALERTAS = "maintenpro_alertas_v1";
  const [alertas, setAlertas] = useState(()=>{
    try{const r=localStorage.getItem(SK_ALERTAS);return r?JSON.parse(r):{};}catch{return{};}
  });
  const [modalAlerta, setModalAlerta] = useState(null);
  const [alertaForm, setAlertaForm]   = useState({intervalo:"400",aviso:"50"});

  const salvarAlerta = () => {
    const novo = {...alertas, [modalAlerta]:{intervalo:parseInt(alertaForm.intervalo), aviso:parseInt(alertaForm.aviso)}};
    setAlertas(novo);
    try{localStorage.setItem(SK_ALERTAS, JSON.stringify(novo));}catch{}
    setModalAlerta(null);
  };

  // Britadores conicos  -  calcular horimetro atual e status do alerta
  const britadoresCOnicos = DEMO_EQUIPS.filter(e=>e.tipo==="Britador Conico");
  const getStatusAlerta = (eqId) => {
    const cfg = alertas[eqId];
    if(!cfg) return null;
    // Pega o ultimo horimetro registrado para este equipamento
    const recsEq = records.filter(r=>(r.eq_codigo===eqId||r.equipamento===eqId)&&r.horimetro).sort((a,b)=>new Date(b.criadoEm)-new Date(a.criadoEm));
    if(!recsEq.length) return null;
    const ultimoH = parseFloat(recsEq[0].horimetro)||0;
    // Pega o horimetro da ultima troca de revestimento
    const ultimaTroca = records.filter(r=>(r.eq_codigo===eqId||r.equipamento===eqId)&&r.horimetro&&(r.brtItens?.["hp_m1"]?.on||r.brtItens?.["hp_m2"]?.on||r.brtItens?.["pa_m1"]?.on||r.brtItens?.["pa_m2"]?.on)).sort((a,b)=>new Date(b.criadoEm)-new Date(a.criadoEm));
    const hTroca = ultimaTroca.length ? parseFloat(ultimaTroca[0].horimetro)||0 : 0;
    const hUsado = ultimoH - hTroca;
    const pct    = (hUsado/cfg.intervalo)*100;
    const faltam = cfg.intervalo - hUsado;
    if(faltam<=0)       return {nivel:"vencido",  cor:"#ef4444", texto:`VENCIDO! ${Math.abs(Math.round(faltam))}h atraso`, hUsado, faltam, pct:100};
    if(faltam<=cfg.aviso) return {nivel:"alerta",   cor:C.yellow,  texto:`Trocar em ${Math.round(faltam)}h`, hUsado, faltam, pct};
    return                       {nivel:"ok",       cor:C.green,   texto:`OK  -  ${Math.round(faltam)}h restantes`, hUsado, faltam, pct};
  };

  const alertasAtivos = britadoresCOnicos.map(e=>({...e, status:getStatusAlerta(e.id)})).filter(e=>e.status&&e.status.nivel!=="ok");

  // -- Filtro por periodo --
  const recPeriodo = records.filter(r=>{
    if(!r.criadoEm) return false;
    const d = new Date(r.criadoEm);
    if(periodo==="mes")  return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    if(periodo==="sem")  return (now-d)<=7*24*60*60*1000;
    if(periodo==="hoje") return d.toDateString()===now.toDateString();
    return true;
  });

  const recFiltrado = eqFiltro ? recPeriodo.filter(r=>(r.eq_codigo||r.equipamento)===eqFiltro) : recPeriodo;
  const equipsUniq  = [...new Set(recPeriodo.map(r=>r.eq_codigo||r.equipamento))].filter(Boolean);

  // -- Graficos --
  const dadosOcorr  = equipsUniq.map(id=>({id,nome:id,v:recPeriodo.filter(r=>(r.eq_codigo||r.equipamento)===id).length})).sort((a,b)=>b.v-a.v).slice(0,8);
  const dadosParada = equipsUniq.map(id=>{const mins=recPeriodo.filter(r=>(r.eq_codigo||r.equipamento)===id&&r.inicio&&r.fim).reduce((a,r)=>a+Math.floor((new Date(r.fim)-new Date(r.inicio))/60000),0);return{id,nome:id,v:mins};}).filter(d=>d.v>0).sort((a,b)=>b.v-a.v).slice(0,8);

  // -- Disponibilidade (horas disponiveis - horas paradas / horas disponiveis * 100) --
  const horasNoPeriodo = periodo==="hoje"?24:periodo==="sem"?168:periodo==="mes"?new Date(now.getFullYear(),now.getMonth()+1,0).getDate()*24:8760;
  const dadosDisp = equipsUniq.map(id=>{
    const mins = recPeriodo.filter(r=>(r.eq_codigo||r.equipamento)===id&&r.inicio&&r.fim).reduce((a,r)=>a+Math.floor((new Date(r.fim)-new Date(r.inicio))/60000),0);
    const disp = Math.max(0,((horasNoPeriodo*60-mins)/(horasNoPeriodo*60))*100);
    return{id,nome:id,v:Math.round(disp)};
  }).sort((a,b)=>a.v-b.v).slice(0,8);

  // -- Comparativo mes a mes (ultimos 6 meses) --
  const meses = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(),now.getMonth()-5+i,1);
    return{label:d.toLocaleDateString("pt-BR",{month:"short",year:"2-digit"}),mes:d.getMonth(),ano:d.getFullYear()};
  });
  const dadosMensal = meses.map(m=>({
    id:m.label,
    nome:m.label,
    v:records.filter(r=>r.criadoEm&&new Date(r.criadoEm).getMonth()===m.mes&&new Date(r.criadoEm).getFullYear()===m.ano).length
  }));

  // -- Pecas trocadas --
  const contarPeca = (tipo) => {
    let total = 0;
    recPeriodo.forEach(r=>{
      if(r.tcItens){
        const item = r.tcItens[tipo];
        if(item?.on && item?.qty) total += parseInt(item.qty)||0;
        else if(item?.on) total += 1;
      }
    });
    return total;
  };
  const pecas = [
    {label:"Roletes de Carga",    v:contarPeca("rc"),  cor:C.orange},
    {label:"Roletes de Retorno",  v:contarPeca("rr"),  cor:C.orange},
    {label:"Roletes de Impacto",  v:contarPeca("ri"),  cor:C.orange},
    {label:"Cavaletes de Carga",  v:contarPeca("cc"),  cor:C.yellow},
    {label:"Cavaletes de Retorno",v:contarPeca("cr"),  cor:C.yellow},
    {label:"Correias",            v:contarPeca("tc1"), cor:"#a855f7"},
    {label:"Tambores de Tracao",  v:contarPeca("tt"),  cor:"#06b6d4"},
    {label:"Tambores do Pe",      v:contarPeca("tp"),  cor:"#06b6d4"},
  ].filter(p=>p.v>0);

  // -- Stats gerais --
  const totalMins = recFiltrado.filter(r=>r.fim).reduce((a,r)=>a+Math.floor((new Date(r.fim)-new Date(r.inicio))/60000),0);
  const stats=[
    ["Total",recFiltrado.length,"#7a9bb5"],
    ["Em Andamento",recFiltrado.filter(r=>r.status==="Em Andamento").length,C.orange],
    ["Concluidas",recFiltrado.filter(r=>r.status==="Concluida").length,C.green],
    ["Tempo Parado",totalMins,C.yellow],
  ];

  const fin = (rec) => setRecords(records.map(r=>r.id===rec.id?{...r,fim:new Date().toISOString(),status:"Concluida"}:r));
  const del = (id) => setRecords(records.filter(r=>r.id!==id));
  const filtered = records.filter(r=>{
    const q=fs.q.toLowerCase();
    return(!q||(r.eq_nome||"").toLowerCase().includes(q)||(r.operador||"").toLowerCase().includes(q))&&(!fs.status||r.status===fs.status);
  });

  const si  = {...C.input,padding:"8px 10px",fontSize:13};
  const abaBt = (id,label,icon) => (
    <button onClick={()=>setAba(id)} style={{flex:1,padding:"8px 4px",borderRadius:9,background:aba===id?"#111e2e":"transparent",border:aba===id?`1.5px solid ${C.border}`:"1.5px solid transparent",color:aba===id?C.text:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
      {icon}{label}
    </button>
  );

  // -- Gerar resumo WhatsApp --
  const enviarWhatsApp = () => {
    const hoje = now.toLocaleDateString("pt-BR");
    const ativos = records.filter(r=>r.status==="Em Andamento");
    let msg = ` *RELATÓRIO DE MANUTENÇÃO*
`;
    msg += ` ${hoje}
`;
    msg += `------------------
`;
    msg += ` *RESUMO DO PERÍODO*
`;
    msg += `* Total de registros: ${recFiltrado.length}
`;
    msg += `* Em andamento: ${recFiltrado.filter(r=>r.status==="Em Andamento").length}
`;
    msg += `* Concluídas: ${recFiltrado.filter(r=>r.status==="Concluida").length}
`;
    msg += `* Tempo total parado: ${totalMins>=60?Math.floor(totalMins/60)+"h "+totalMins%60+"min":totalMins+"min"}
`;
    if(ativos.length>0){
      msg += `
! *EM ANDAMENTO AGORA*
`;
      ativos.forEach(r=>{ msg += `* ${r.eq_codigo||""} - ${r.eq_nome||""} (${r.operador||""})
`; });
    }
    msg += `
_Ceballos MaintenPro_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  // -- Imprimir relatorio --
  const imprimir = () => {
    const hoje = now.toLocaleDateString("pt-BR");
    const conteudo = `
      <html><head><title>Relatorio de Manutencao</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#111}
        h1{color:#FF6B2B;border-bottom:2px solid #FF6B2B;padding-bottom:8px}
        h2{color:#1e3a5f;margin-top:20px}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th{background:#FF6B2B;color:#fff;padding:8px;text-align:left;font-size:12px}
        td{padding:7px 8px;border-bottom:1px solid #eee;font-size:12px}
        tr:nth-child(even){background:#f9f9f9}
        .stat{display:inline-block;margin:8px;padding:10px 16px;background:#f0f0f0;border-radius:8px;text-align:center}
        .stat-v{font-size:24px;font-weight:900;color:#FF6B2B}
        .stat-l{font-size:11px;color:#666}
        .badge{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700}
        .andamento{background:#FF6B2B22;color:#FF6B2B}
        .concluida{background:#22C55E22;color:#22C55E}
      </style></head><body>
      <h1> Ceballos MaintenPro  -  Relatório de Manutenção</h1>
      <p><strong>Período:</strong> ${periodo==="mes"?"Mês atual":periodo==="sem"?"Últimos 7 dias":periodo==="hoje"?"Hoje":"Todo o período"} &nbsp;|&nbsp; <strong>Gerado em:</strong> ${hoje}</p>
      <div>
        <div class="stat"><div class="stat-v">${recFiltrado.length}</div><div class="stat-l">TOTAL</div></div>
        <div class="stat"><div class="stat-v">${recFiltrado.filter(r=>r.status==="Em Andamento").length}</div><div class="stat-l">EM ANDAMENTO</div></div>
        <div class="stat"><div class="stat-v">${recFiltrado.filter(r=>r.status==="Concluida").length}</div><div class="stat-l">CONCLUÍDAS</div></div>
        <div class="stat"><div class="stat-v">${totalMins>=60?Math.floor(totalMins/60)+"h":totalMins+"min"}</div><div class="stat-l">TEMPO PARADO</div></div>
      </div>
      <h2>Registros de Manutenção</h2>
      <table>
        <tr><th>Equipamento</th><th>Tipo</th><th>Técnico</th><th>Início</th><th>Fim</th><th>Duração</th><th>Status</th></tr>
        ${recFiltrado.map(r=>{
          const mins = r.inicio&&r.fim?Math.floor((new Date(r.fim)-new Date(r.inicio))/60000):null;
          const dur  = mins?mins>=60?Math.floor(mins/60)+"h "+mins%60+"min":mins+"min":"Em andamento";
          return `<tr>
            <td><strong>${r.eq_codigo||""}</strong> ${r.eq_nome||""}</td>
            <td>${r.tipoManutencao||"Checklist"}</td>
            <td>${r.operador||""}</td>
            <td>${r.inicio?new Date(r.inicio).toLocaleString("pt-BR"):""}</td>
            <td>${r.fim?new Date(r.fim).toLocaleString("pt-BR"):"-"}</td>
            <td>${dur}</td>
            <td><span class="badge ${r.status==="Concluida"?"concluida":"andamento"}">${r.status}</span></td>
          </tr>`;
        }).join("")}
      </table>
      <p style="margin-top:30px;font-size:11px;color:#999;text-align:center">Ceballos MaintenPro (c)  -  Eng. Sergio Cardoso</p>
      </body></html>
    `;
    const w = window.open("","_blank");
    w.document.write(conteudo);
    w.document.close();
    w.print();
  };

  // -- Historico por equipamento --
  const recEqDetalhe = eqDetalhe ? records.filter(r=>(r.eq_codigo||r.equipamento)===eqDetalhe) : [];

  return(
    <div style={{paddingBottom:80}}>

      {/* ABAS */}
      <div style={{display:"flex",background:"#091420",borderRadius:10,padding:3,marginBottom:16,border:`1.5px solid ${C.border}`}}>
        {abaBt("graficos",  "Graficos",  <IcoChart s={12}/>)}
        {abaBt("alertas",   alertasAtivos.length>0?" Alertas":"Alertas", <IcoAlert s={12}/>)}
        {abaBt("pecas",     "Pecas",     <IcoWrench s={12}/>)}
        {abaBt("historico", "Historico", <IcoList s={12}/>)}
        {abaBt("lista",     "Registros", <IcoGear s={12}/>)}
      </div>

      {/* -- GRAFICOS -- */}
      {/* -- ALERTAS DE HORIMETRO -- */}
      {aba==="alertas"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontSize:15,fontWeight:800}}>Alertas de Horímetro</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Revestimento dos britadores cônicos</div>
            </div>
          </div>

          {/* Cards de cada britador conico */}
          {britadoresCOnicos.map(eq=>{
            const cfg    = alertas[eq.id];
            const status = getStatusAlerta(eq.id);
            return(
              <Card key={eq.id} style={{marginBottom:12,borderColor:status?.nivel==="vencido"?"#ef444444":status?.nivel==="alerta"?C.yellow+"44":C.border}}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:800,color:C.orange,marginBottom:2}}>{eq.codigo}</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{eq.nome}</div>
                  </div>
                  <button
                    onClick={()=>{setModalAlerta(eq.id);setAlertaForm({intervalo:cfg?.intervalo||"400",aviso:cfg?.aviso||"50"});}}
                    style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}
                  >
                    <IcoGear s={13}/> {cfg?"Editar":"Configurar"}
                  </button>
                </div>

                {!cfg&&(
                  <div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:13}}>
                    Nenhum alerta configurado. Clique em <strong>Configurar</strong> para definir o intervalo de troca.
                  </div>
                )}

                {cfg&&status&&(
                  <>
                    {/* Status badge */}
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:status.cor+"18",border:`1px solid ${status.cor}44`,borderRadius:10,marginBottom:12}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:status.cor,flexShrink:0,animation:status.nivel!=="ok"?"pulse 1.4s infinite":"none"}}/>
                      <span style={{fontSize:13,fontWeight:700,color:status.cor}}>{status.texto}</span>
                    </div>

                    {/* Barra de progresso */}
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:11,color:C.muted}}>Horas desde última troca</span>
                        <span style={{fontSize:11,fontWeight:700,color:status.cor}}>{Math.round(status.hUsado)}h / {cfg.intervalo}h</span>
                      </div>
                      <div style={{height:10,background:"#0d1820",borderRadius:5,overflow:"hidden"}}>
                        <div style={{height:"100%",width:Math.min(100,status.pct)+"%",background:status.nivel==="vencido"?"#ef4444":status.nivel==="alerta"?C.yellow:C.green,borderRadius:5,transition:"width .4s ease"}}/>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <Kv l="INTERVALO" v={cfg.intervalo+"h"}/>
                      <Kv l="AVISAR COM" v={cfg.aviso+"h de antecedencia"}/>
                    </div>
                  </>
                )}
              </Card>
            );
          })}

          {/* Modal configurar alerta */}
          {modalAlerta&&(
            <Modal title="Configurar Alerta de Horímetro" onClose={()=>setModalAlerta(null)}>
              <div style={{padding:"8px 12px",background:"#0d1e2e",borderRadius:8,fontSize:13,color:C.muted,marginBottom:16}}>
                <strong style={{color:C.orange}}>{britadoresCOnicos.find(e=>e.id===modalAlerta)?.nome}</strong>
                <div style={{marginTop:4,fontSize:12}}>Defina quando alertar para troca do revestimento (manto e côncavo)</div>
              </div>

              <Fld label="Intervalo de troca (horas)">
                <input type="number" style={C.input} placeholder="Ex: 400" value={alertaForm.intervalo}
                  onChange={e=>setAlertaForm(p=>({...p,intervalo:e.target.value}))}/>
                <div style={{fontSize:11,color:C.muted,marginTop:4}}>A cada quantas horas de operação trocar o revestimento</div>
              </Fld>

              <Fld label="Avisar com antecedência (horas)">
                <input type="number" style={C.input} placeholder="Ex: 50" value={alertaForm.aviso}
                  onChange={e=>setAlertaForm(p=>({...p,aviso:e.target.value}))}/>
                <div style={{fontSize:11,color:C.muted,marginTop:4}}>Quantas horas antes do vencimento emitir o alerta amarelo</div>
              </Fld>

              <div style={{padding:"10px 12px",background:"#0a1520",borderRadius:8,fontSize:12,color:C.muted,marginBottom:16}}>
                <div style={{fontWeight:700,color:C.text,marginBottom:4}}>Exemplo com os valores acima:</div>
                <div> <strong>OK</strong>  -  abaixo de {Math.max(0,(parseInt(alertaForm.intervalo)||400)-(parseInt(alertaForm.aviso)||50))}h</div>
                <div> <strong>Alerta</strong>  -  entre {Math.max(0,(parseInt(alertaForm.intervalo)||400)-(parseInt(alertaForm.aviso)||50))}h e {alertaForm.intervalo||400}h</div>
                <div> <strong>Vencido</strong>  -  acima de {alertaForm.intervalo||400}h sem troca</div>
              </div>

              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>setModalAlerta(null)} outline full>Cancelar</Btn>
                <Btn onClick={salvarAlerta} full disabled={!alertaForm.intervalo||!alertaForm.aviso}>
                  <IcoCheck s={14}/> Salvar Alerta
                </Btn>
              </div>
            </Modal>
          )}
        </>
      )}

      {aba==="ordens"&&(
        <div style={{paddingBottom:80}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:800}}>Ordens de Servico</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["Solicitadas",ordens.filter(o=>o.status==="Solicitada").length,"#a855f7"],
              ["Programadas",ordens.filter(o=>o.status==="Programada").length,"#2E75B6"],
              ["Em Andamento",ordens.filter(o=>o.status==="Em andamento").length,"#FF6B2B"],
              ["Concluidas",ordens.filter(o=>o.status==="Concluida").length,"#22C55E"],
            ].map(([l,v,cor])=>(
              <div key={l} style={{background:"#0a1520",border:"1.5px solid #172535",borderRadius:12,padding:"13px 14px"}}>
                <div style={{fontSize:10,color:"#3a5a6a",marginBottom:3}}>{l.toUpperCase()}</div>
                <div style={{fontSize:26,fontWeight:900,color:cor}}>{v}</div>
              </div>
            ))}
          </div>
          {ordens.length===0
            ?<div style={{textAlign:"center",padding:44,background:"#0a1520",borderRadius:12,border:"1.5px dashed #172535"}}><div style={{fontSize:36,marginBottom:8}}></div><div style={{color:"#4a6a7a"}}>Nenhuma OS registrada</div></div>
            :ordens.map(os=><OSCard key={os.id} os={os} isManager={true} onUpdate={(id,status)=>setOrdens(ordens.map(o=>o.id===id?{...o,status}:o))}/>)
          }
        </div>
      )}

      {aba==="graficos"&&(
        <>
          {/* Filtros */}
          <Card style={{marginBottom:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <Lbl t="Periodo"/>
                <select style={si} value={periodo} onChange={e=>setPeriodo(e.target.value)}>
                  <option value="hoje">Hoje</option>
                  <option value="sem">Ultimos 7 dias</option>
                  <option value="mes">Mes atual</option>
                  <option value="tudo">Tudo</option>
                </select>
              </div>
              <div>
                <Lbl t="Equipamento"/>
                <select style={si} value={eqFiltro} onChange={e=>setEqFiltro(e.target.value)}>
                  <option value="">Todos</option>
                  {equipsUniq.map(id=><option key={id} value={id}>{id}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {stats.map(([l,v,cor])=>(
              <Card key={l}>
                <div style={{fontSize:10,color:"#3a5a6a",marginBottom:3}}>{l.toUpperCase()}</div>
                <div style={{fontSize:26,fontWeight:900,color:cor}}>
                  {l==="Tempo Parado"?(v>=60?Math.floor(v/60)+"h "+v%60+"min":v+"min"):v}
                </div>
              </Card>
            ))}
          </div>

          {/* Grafico ocorrencias */}
          <Card style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><div style={{fontSize:13,fontWeight:800}}>Ranking de Paradas</div><div style={{fontSize:11,color:C.muted}}>Equipamentos com mais ocorrencias</div></div>
            </div>
            <BarChart dados={dadosOcorr} cor={C.orange} unidade="n"/>
          </Card>

          {/* Grafico tempo */}
          <Card style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><div style={{fontSize:13,fontWeight:800}}>Tempo de Parada</div><div style={{fontSize:11,color:C.muted}}>Horas fora de operacao</div></div>
            </div>
            <BarChart dados={dadosParada} cor={C.yellow} unidade="h"/>
          </Card>

          {/* Grafico disponibilidade */}
          <Card style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><div style={{fontSize:13,fontWeight:800}}>Disponibilidade (%)</div><div style={{fontSize:11,color:C.muted}}>% do tempo em operacao</div></div>
            </div>
            <BarChart dados={dadosDisp} cor={C.green} unidade="n"/>
          </Card>

          {/* Comparativo mensal */}
          <Card style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div><div style={{fontSize:13,fontWeight:800}}>Comparativo Mensal</div><div style={{fontSize:11,color:C.muted}}>Ultimos 6 meses</div></div>
            </div>
            <BarChart dados={dadosMensal} cor="#a855f7" unidade="n"/>
          </Card>

          {/* Botoes relatorio */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Btn onClick={enviarWhatsApp} color="#25D366" full>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </Btn>
            <Btn onClick={imprimir} color="#1e3a5f" full>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Imprimir
            </Btn>
          </div>
        </>
      )}

      {/* -- PECAS TROCADAS -- */}
      {aba==="pecas"&&(
        <>
          <Card style={{marginBottom:14}}>
            <Lbl t="Periodo"/>
            <select style={si} value={periodo} onChange={e=>setPeriodo(e.target.value)}>
              <option value="hoje">Hoje</option>
              <option value="sem">Ultimos 7 dias</option>
              <option value="mes">Mes atual</option>
              <option value="tudo">Tudo</option>
            </select>
          </Card>

          <Card style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,marginBottom:14}}>Pecas Trocadas nas Transportadoras</div>
            {pecas.length===0
              ?<div style={{textAlign:"center",padding:20,color:C.muted}}>Sem dados de pecas no periodo</div>
              :pecas.map(p=>(
                <div key={p.label} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:13,color:C.text,fontWeight:600}}>{p.label}</span>
                    <span style={{fontSize:13,color:p.cor,fontWeight:800}}>{p.v} unid.</span>
                  </div>
                  <div style={{height:8,background:"#0d1820",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:Math.min(100,(p.v/Math.max(...pecas.map(x=>x.v)))*100)+"%",background:p.cor,borderRadius:4}}/>
                  </div>
                </div>
              ))
            }
          </Card>

          {/* Pecas por equipamento */}
          <Card>
            <div style={{fontSize:13,fontWeight:800,marginBottom:12}}>Roletes por Transportadora</div>
            {equipsUniq.filter(id=>id.startsWith("TC")).map(id=>{
              const recs = recPeriodo.filter(r=>(r.eq_codigo||r.equipamento)===id);
              const qtdRoletes = recs.reduce((a,r)=>{
                if(!r.tcItens) return a;
                return a + (parseInt(r.tcItens["rc"]?.qty)||0) + (parseInt(r.tcItens["rr"]?.qty)||0) + (parseInt(r.tcItens["ri"]?.qty)||0);
              },0);
              if(qtdRoletes===0) return null;
              return(
                <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:13,color:C.text,fontWeight:600}}>{id}</span>
                  <span style={{fontSize:13,color:C.orange,fontWeight:800}}>{qtdRoletes} roletes</span>
                </div>
              );
            })}
          </Card>
        </>
      )}

      {/* -- HISTORICO POR EQUIPAMENTO -- */}
      {aba==="historico"&&(
        <>
          <Card style={{marginBottom:14}}>
            <Lbl t="Selecione o Equipamento"/>
            <select style={si} value={eqDetalhe||""} onChange={e=>setEqDetalhe(e.target.value||null)}>
              <option value="">Selecione...</option>
              {[...new Set(records.map(r=>r.eq_codigo||r.equipamento))].filter(Boolean).sort().map(id=>(
                <option key={id} value={id}>{id}  -  {records.find(r=>(r.eq_codigo||r.equipamento)===id)?.eq_nome||""}</option>
              ))}
            </select>
          </Card>

          {eqDetalhe&&(
            <>
              {/* Resumo do equipamento */}
              <Card style={{marginBottom:14,borderColor:C.orange+"44"}}>
                <div style={{fontSize:15,fontWeight:800,color:C.orange,marginBottom:10}}>{eqDetalhe}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  <Kv l="MANUTENCOES" v={recEqDetalhe.length}/>
                  <Kv l="CONCLUIDAS" v={recEqDetalhe.filter(r=>r.status==="Concluida").length}/>
                  <Kv l="HORAS PARADO" v={(()=>{const m=recEqDetalhe.filter(r=>r.fim).reduce((a,r)=>a+Math.floor((new Date(r.fim)-new Date(r.inicio))/60000),0);return m>=60?Math.floor(m/60)+"h":m+"min";})()}/>
                </div>
              </Card>

              {/* Historico completo */}
              <div style={{fontSize:13,fontWeight:700,color:C.muted,marginBottom:10}}>HISTÓRICO COMPLETO ({recEqDetalhe.length} registros)</div>
              {recEqDetalhe.length===0
                ?<Card style={{textAlign:"center",padding:30}}><div style={{color:C.muted}}>Nenhum registro para este equipamento</div></Card>
                :recEqDetalhe.map(r=><ManutCard key={r.id} rec={r} onFinish={fin} onDelete={del}/>)
              }
            </>
          )}

          {!eqDetalhe&&(
            <Card style={{textAlign:"center",padding:44}}>
              <div style={{fontSize:36,marginBottom:8}}></div>
              <div style={{color:C.muted}}>Selecione um equipamento para ver o historico completo</div>
            </Card>
          )}
        </>
      )}

      {/* -- LISTA GERAL -- */}
      {aba==="lista"&&(
        <>
          <Card style={{marginBottom:14}}>
            <input style={{...C.input,marginBottom:8}} placeholder="Buscar equipamento, tecnico..." value={fs.q} onChange={e=>setFs(p=>({...p,q:e.target.value}))}/>
            <select style={si} value={fs.status} onChange={e=>setFs(p=>({...p,status:e.target.value}))}>
              <option value="">Todos status</option>{Object.keys(COR_ST).map(s=><option key={s}>{s}</option>)}
            </select>
          </Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:13,color:C.muted}}>{filtered.length} registro{filtered.length!==1?"s":""}</span>
          </div>
          {filtered.length===0
            ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:8}}></div><div style={{color:C.muted}}>Nenhum registro encontrado</div></Card>
            :filtered.map(r=><ManutCard key={r.id} rec={r} onFinish={fin} onDelete={del}/>)
          }
        </>
      )}
    </div>
  );
}

// ===========================================================
// APP PRINCIPAL
// ===========================================================
export default function App() {
  const [user, setUser]       = useState(null);
  const [records, setRecords] = useState([]);
  const [ordens, setOrdens]   = useState([]);
  const [tab, setTab]         = useState("novo");
  const [adminTab, setAdminTab] = useState("pedreiras");
  const [tick, setTick]       = useState(new Date());

  useEffect(()=>{ const t=setInterval(()=>setTick(new Date()),30000); return()=>clearInterval(t); },[]);

  const logout = () => { setUser(null); setRecords([]); setTab("novo"); };

  const finOp = (rec) => setRecords(records.map(r=>r.id===rec.id?{...r,fim:new Date().toISOString(),status:"Concluida"}:r));

  const activeN = records.filter(r=>r.status==="Em Andamento").length;

  if(!user) return <LoginPage onLogin={u=>{setUser(u);}}/>;

  const tabB = (id,label,icon) => ({
    flex:1,padding:"9px 6px",borderRadius:9,
    background:tab===id?"#111e2e":"transparent",
    border:tab===id?"1.5px solid #1e3044":"1.5px solid transparent",
    color:tab===id?C.text:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontFamily:"inherit"
  });

  const adminTabB = (id,label) => ({
    flex:1,padding:"8px 4px",borderRadius:8,
    background:adminTab===id?C.orange+"22":"transparent",
    border:adminTab===id?`1px solid ${C.orange}44`:"1px solid transparent",
    color:adminTab===id?C.orange:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",
    fontFamily:"inherit",
  });

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Barlow','Segoe UI',sans-serif",maxWidth:480,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        select option{background:#0a1520;color:#deeaf5}
        input[type="datetime-local"]::-webkit-calendar-picker-indicator{filter:invert(.55)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e3044;border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeUp{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
      `}</style>

      {/* HEADER */}
      <div style={{background:C.bg,borderBottom:`1px solid ${C.border}`,padding:"13px 15px 11px",position:"sticky",top:0,zIndex:99}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:11}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:C.orange,letterSpacing:.5,lineHeight:1}}>CEBALLOS</div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.2}}>MaintenPro</div>
            {user.pedreira_nome&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>{user.pedreira_nome}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:C.muted}}>{tick.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit"})}</div>
            <div style={{fontSize:13,fontWeight:700}}>{tick.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",marginTop:3}}>
              <Tag label={user.perfil} color={user.perfil==="admin"?"#a855f7":user.perfil==="gerente"?C.yellow:C.orange}/>
              {activeN>0&&<div style={{fontSize:11,color:C.orange,fontWeight:700,display:"flex",alignItems:"center",gap:3}}><span style={{width:5,height:5,borderRadius:"50%",background:C.orange,animation:"pulse 1.4s infinite"}}/>{activeN}</div>}
            </div>
          </div>
        </div>

        {/* USER INFO + LOGOUT */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",background:"#0a1520",borderRadius:10,border:`1px solid ${C.border}`,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:C.orange+"22",border:`1.5px solid ${C.orange}44`,display:"flex",alignItems:"center",justifyContent:"center",color:C.orange}}>
              <IcoUser s={13}/>
            </div>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{user.nome}</div>
          </div>
          <button onClick={logout} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,fontFamily:"inherit"}}>
            <IcoLogout s={13}/> Sair
          </button>
        </div>

        {/* TABS POR PERFIL */}
        {user.perfil==="admin"&&(
          <div style={{display:"flex",gap:4}}>
            {[["pedreiras","Pedreiras",<IcoBuilding s={11}/>],["usuarios","Usuarios",<IcoUser s={11}/>],["equipamentos","Equipamentos",<IcoGear s={11}/>],["dashboard","Dashboard",<IcoChart s={11}/>]].map(([id,label,icon])=>(
              <button key={id} onClick={()=>setAdminTab(id)} style={adminTabB(id,label)}>
                {icon} {label}
              </button>
            ))}
          </div>
        )}

        {user.perfil==="gerente"&&(
          <div style={{display:"flex",background:"#091420",borderRadius:10,padding:3,border:`1.5px solid ${C.border}`}}>
            <button style={tabB("dashboard","Dashboard",<IcoChart s={13}/>)} onClick={()=>setTab("dashboard")}><IcoChart s={13}/>Dashboard</button>
            <button style={tabB("historico","Historico",<IcoList s={13}/>)} onClick={()=>setTab("historico")}><IcoList s={13}/>Historico</button>
          </div>
        )}

        {user.perfil==="operador"&&(
          <div style={{display:"flex",background:"#091420",borderRadius:10,padding:3,border:`1.5px solid ${C.border}`}}>
            <button style={tabB("novo","Registrar",<IcoPlus s={13}/>)} onClick={()=>setTab("novo")}><IcoPlus s={13}/>Registrar</button>
            <button style={tabB("historico","Historico",<IcoList s={13}/>)} onClick={()=>setTab("historico")}><IcoList s={13}/>Historico ({records.length})</button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{padding:"16px 14px",animation:"fadeUp .2s ease"}}>

        {/* ADMIN */}
        {user.perfil==="admin"&&(
          <>
            {adminTab==="pedreiras"&&<AdminPedreiras/>}
            {adminTab==="usuarios"&&<AdminUsuarios/>}
            {adminTab==="equipamentos"&&<AdminEquipamentos/>}
            {adminTab==="dashboard"&&<Dashboard records={records} setRecords={setRecords} ordens={ordens} setOrdens={setOrdens} user={user}/>}
          </>
        )}

        {/* GERENTE */}
        {user.perfil==="gerente"&&(
          <Dashboard records={records} setRecords={setRecords} ordens={ordens} setOrdens={setOrdens} user={user}/>
        )}

        {/* OPERADOR */}
        {user.perfil==="operador"&&(
          <>
            {/* Seletor sempre visivel exceto historico e os */}
            {(tab==="novo"||tab==="inspecao_form"||tab==="os_form")&&(
              <SeletorTipo
                tipo={tab==="inspecao_form"?"inspecao":tab==="os_form"?"os":"manutencao"}
                onChange={t=>{
                  if(t==="os") setTab("os_form");
                  else if(t==="inspecao") setTab("inspecao_form");
                  else setTab("novo");
                }}
              />
            )}
            {tab==="novo"&&<OperadorForm user={user} records={records} setRecords={setRecords}/>}
            {tab==="inspecao_form"&&<FormInspecao user={user} records={records} setRecords={setRecords} onBack={()=>setTab("novo")}/>}
            {tab==="os_form"&&<FormOS user={user} ordens={ordens} setOrdens={setOrdens} onBack={()=>setTab("os")}/>}
            {tab==="os"&&(
              <div style={{paddingBottom:80}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontSize:16,fontWeight:800}}>Ordens de Servico</div>
                  <Btn onClick={()=>setTab("os_form")} sm><IcoPlus s={14}/> Nova OS</Btn>
                </div>
                {ordens.length===0
                  ?<div style={{textAlign:"center",padding:44,background:"#0a1520",borderRadius:12,border:"1.5px dashed #172535"}}><div style={{fontSize:36,marginBottom:8}}></div><div style={{color:"#4a6a7a"}}>Nenhuma OS aberta ainda</div></div>
                  :ordens.map(os=><OSCard key={os.id} os={os} isManager={false} onUpdate={()=>{}}/>)
                }
              </div>
            )}
            {tab==="historico"&&(
              records.length===0
                ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:8}}></div><div style={{color:C.muted}}>Nenhum registro ainda.</div></Card>
                :records.map(r=><ManutCard key={r.id} rec={r} onFinish={finOp} onDelete={null}/>)
            )}
          </>
        )}
      </div>

      <div style={{textAlign:"center",padding:"8px 16px 20px",fontSize:11,color:"#1a2e3e"}}>
        Ceballos MaintenPro (c) 2025  -  Eng. Sergio Cardoso
      </div>
    </div>
  );
}

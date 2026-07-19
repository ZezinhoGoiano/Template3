/* ================================================================
   APEX MOTORS ADMIN — modules/dashboard.js
   Busca dados do Supabase e preenche o dashboard
================================================================ */

'use strict';

/* ================================================================
   HELPERS
================================================================ */
const fmt = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const fmtNum = (n) =>
  new Intl.NumberFormat('pt-BR').format(n);

const el = (id) => document.getElementById(id);

/* ================================================================
   DADOS SIMULADOS (enquanto não há dados reais no Supabase)
   Substitua pelas queries reais conforme os dados forem chegando
================================================================ */
const getMockData = () => ({
  // Métricas
  stock:       6,
  stockValue:  11210000,
  featured:    2,
  soldMonth:   3,
  leads:       28,
  whatsapp:    74,
  revenue:     4890000,
  conversion:  10.7,
  topViewed:   'Porsche 911 S',
  lastUpdate:  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),

  // Gráficos — últimos 6 meses
  months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],

  revenue_data:  [1800000, 2400000, 1900000, 3200000, 2800000, 4890000],
  views_data:    [1200,    1850,    1400,    2100,    1780,    2640],
  clicks_data:   [340,     520,     410,     680,     590,     820],
  leads_data:    [12,      18,      14,      24,      20,      28],
  sales_data:    [1,       2,       1,       3,       2,       3],
  whatsapp_data: [28,      41,      35,      58,      49,      74],

  // Por marca
  brands:       ['Porsche', 'Mercedes', 'BMW', 'Lamborghini', 'Audi', 'Range Rover'],
  brands_sales: [8, 5, 7, 3, 6, 4],

  // Por origem
  origins:       ['WhatsApp', 'Instagram', 'Google', 'Facebook', 'Direto'],
  origins_leads: [38, 27, 18, 9, 8],

  // Status estoque
  stock_available: 6,
  stock_reserved:  1,
  stock_sold:      1,
  stock_preparing: 0,
});

/* ================================================================
   PREENCHE CARDS DE MÉTRICAS
================================================================ */
const fillMetrics = (data) => {
  const set = (id, value) => {
    const el_ = el(id);
    if (el_) el_.textContent = value;
  };

  set('metricStock',       data.stock);
  set('metricStockValue',  fmt(data.stockValue));
  set('metricFeatured',    data.featured);
  set('metricSoldMonth',   data.soldMonth);
  set('metricLeads',       fmtNum(data.leads));
  set('metricWhatsapp',    fmtNum(data.whatsapp));
  set('metricRevenue',     fmt(data.revenue));
  set('metricConversion',  `${data.conversion}%`);
  set('metricTopViewed',   data.topViewed);
  set('metricLastUpdate',  data.lastUpdate);
  set('lastUpdate',        data.lastUpdate);
};

/* ================================================================
   GRÁFICO PRINCIPAL — configurações por tipo
================================================================ */
const CHART_CONFIGS = {
  revenue: {
    title:    'Faturamento',
    subtitle: 'Receita dos últimos 6 meses',
    type:     'area',
    getTotal: (d) => `Total: ${fmt(d.revenue_data.reduce((a, b) => a + b, 0))}`,
    getSeries: (d) => [{
      name: 'Faturamento',
      data: d.revenue_data,
    }],
    getCategories: (d) => d.months,
    yFormatter: (val) => fmt(val),
    tooltipFormatter: (val) => fmt(val),
    color: '#1E88E5',
  },

  views: {
    title:    'Visualizações',
    subtitle: 'Visitas ao site nos últimos 6 meses',
    type:     'area',
    getTotal: (d) => `Total: ${fmtNum(d.views_data.reduce((a, b) => a + b, 0))} visitas`,
    getSeries: (d) => [{
      name: 'Visualizações',
      data: d.views_data,
    }],
    getCategories: (d) => d.months,
    yFormatter: (val) => fmtNum(val),
    tooltipFormatter: (val) => `${fmtNum(val)} visitas`,
    color: '#22C55E',
  },

  clicks: {
    title:    'Cliques nos Cards',
    subtitle: 'Interações com cards de veículos',
    type:     'bar',
    getTotal: (d) => `Total: ${fmtNum(d.clicks_data.reduce((a, b) => a + b, 0))} cliques`,
    getSeries: (d) => [{
      name: 'Cliques',
      data: d.clicks_data,
    }],
    getCategories: (d) => d.months,
    yFormatter: (val) => fmtNum(val),
    tooltipFormatter: (val) => `${fmtNum(val)} cliques`,
    color: '#F59E0B',
  },

  leads: {
    title:    'Leads Recebidos',
    subtitle: 'Novos contatos nos últimos 6 meses',
    type:     'bar',
    getTotal: (d) => `Total: ${fmtNum(d.leads_data.reduce((a, b) => a + b, 0))} leads`,
    getSeries: (d) => [{
      name: 'Leads',
      data: d.leads_data,
    }],
    getCategories: (d) => d.months,
    yFormatter: (val) => fmtNum(val),
    tooltipFormatter: (val) => `${fmtNum(val)} leads`,
    color: '#A855F7',
  },

  sales: {
    title:    'Vendas Realizadas',
    subtitle: 'Veículos vendidos por mês',
    type:     'bar',
    getTotal: (d) => `Total: ${d.sales_data.reduce((a, b) => a + b, 0)} vendas`,
    getSeries: (d) => [{
      name: 'Vendas',
      data: d.sales_data,
    }],
    getCategories: (d) => d.months,
    yFormatter: (val) => `${val}`,
    tooltipFormatter: (val) => `${val} venda(s)`,
    color: '#22C55E',
  },

  whatsapp: {
    title:    'Cliques no WhatsApp',
    subtitle: 'Conversas iniciadas via WhatsApp',
    type:     'area',
    getTotal: (d) => `Total: ${fmtNum(d.whatsapp_data.reduce((a, b) => a + b, 0))} cliques`,
    getSeries: (d) => [{
      name: 'WhatsApp',
      data: d.whatsapp_data,
    }],
    getCategories: (d) => d.months,
    yFormatter: (val) => fmtNum(val),
    tooltipFormatter: (val) => `${fmtNum(val)} cliques`,
    color: '#25D366',
  },

  brands: {
    title:    'Marcas Mais Vendidas',
    subtitle: 'Total de vendas por marca',
    type:     'bar',
    getTotal: (d) => `${d.brands_sales.reduce((a, b) => a + b, 0)} vendas no total`,
    getSeries: (d) => [{
      name: 'Vendas',
      data: d.brands_sales,
    }],
    getCategories: (d) => d.brands,
    yFormatter: (val) => `${val}`,
    tooltipFormatter: (val) => `${val} venda(s)`,
    color: '#1E88E5',
    horizontal: true,
  },

  origin: {
    title:    'Leads por Origem',
    subtitle: 'De onde vieram seus contatos',
    type:     'donut',
    getTotal: (d) => `${d.origins_leads.reduce((a, b) => a + b, 0)} leads no total`,
    getSeries: (d) => d.origins_leads,
    getCategories: (d) => d.origins,
    color: '#1E88E5',
  },
};

/* ================================================================
   INSTÂNCIA DO GRÁFICO (singleton para destruir e recriar)
================================================================ */
let chartInstance = null;

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

/* ================================================================
   RENDERIZA O GRÁFICO
================================================================ */
const renderChart = (type, data) => {
  const config  = CHART_CONFIGS[type];
  const wrapper = document.getElementById('mainChart');
  if (!config || !wrapper) return;

  // Anima saída
  wrapper.classList.add('is-changing');

  setTimeout(() => {
    destroyChart();
    wrapper.innerHTML = '';

    // Atualiza header do card
    const titleEl    = el('chartTitle');
    const subtitleEl = el('chartSubtitle');
    const totalEl    = el('chartTotal');

    if (titleEl)    titleEl.textContent    = config.title;
    if (subtitleEl) subtitleEl.textContent = config.subtitle;
    if (totalEl)    totalEl.textContent    = config.getTotal(data);

    // Opções base ApexCharts (tema dark)
    const baseOptions = {
      chart: {
        background: 'transparent',
        toolbar: { show: false },
        animations: {
          enabled: true,
          speed: 600,
          animateGradually: { enabled: true, delay: 80 },
        },
        fontFamily: 'Inter, sans-serif',
      },
      theme: { mode: 'dark' },
      grid: {
        borderColor: 'rgba(255,255,255,0.06)',
        strokeDashArray: 4,
      },
      tooltip: {
        theme: 'dark',
        style: { fontFamily: 'Inter, sans-serif' },
      },
    };

    let options = {};

    if (config.type === 'donut') {
      // Gráfico de rosca para "por origem"
      options = {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'donut',
          height: 320,
        },
        series: config.getSeries(data),
        labels: config.getCategories(data),
        colors: ['#25D366', '#E1306C', '#1E88E5', '#1877F2', '#8B949E'],
        legend: {
          position: 'bottom',
          labels: { colors: '#8B949E' },
        },
        dataLabels: {
          style: { fontFamily: 'Inter, sans-serif', fontSize: '12px' },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total',
                  color: '#8B949E',
                  fontSize: '13px',
                  formatter: () => config.getTotal(data),
                },
              },
            },
          },
        },
      };

    } else if (config.type === 'bar' && config.horizontal) {
      // Barras horizontais para "por marca"
      options = {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar',
          height: 320,
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 4,
            dataLabels: { position: 'top' },
          },
        },
        series: config.getSeries(data),
        xaxis: {
          categories: config.getCategories(data),
          labels: { style: { colors: '#8B949E', fontFamily: 'Inter, sans-serif' } },
        },
        yaxis: {
          labels: { style: { colors: '#8B949E', fontFamily: 'Inter, sans-serif' } },
        },
        colors: [config.color],
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val}`,
          style: { colors: ['#F5F5F5'], fontFamily: 'Inter, sans-serif' },
        },
        tooltip: {
          ...baseOptions.tooltip,
          y: { formatter: config.tooltipFormatter },
        },
      };

    } else if (config.type === 'bar') {
      // Barras verticais
      options = {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar',
          height: 320,
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: '55%',
          },
        },
        series: config.getSeries(data),
        xaxis: {
          categories: config.getCategories(data),
          labels: { style: { colors: '#8B949E', fontFamily: 'Inter, sans-serif' } },
          axisBorder: { show: false },
          axisTicks:  { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: '#8B949E', fontFamily: 'Inter, sans-serif' },
            formatter: config.yFormatter,
          },
        },
        colors: [config.color],
        dataLabels: { enabled: false },
        tooltip: {
          ...baseOptions.tooltip,
          y: { formatter: config.tooltipFormatter },
        },
      };

    } else {
      // Area / Line
      options = {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'area',
          height: 320,
        },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.3,
            opacityTo: 0,
            stops: [0, 100],
          },
        },
        series: config.getSeries(data),
        xaxis: {
          categories: config.getCategories(data),
          labels: { style: { colors: '#8B949E', fontFamily: 'Inter, sans-serif' } },
          axisBorder: { show: false },
          axisTicks:  { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: '#8B949E', fontFamily: 'Inter, sans-serif' },
            formatter: config.yFormatter,
          },
        },
        markers: { size: 4, hover: { size: 6 } },
        colors: [config.color],
        dataLabels: { enabled: false },
        tooltip: {
          ...baseOptions.tooltip,
          y: { formatter: config.tooltipFormatter },
        },
      };
    }

    chartInstance = new ApexCharts(wrapper, options);
    chartInstance.render();

    // Anima entrada
    wrapper.classList.remove('is-changing');

  }, 200);
};

/* ================================================================
   ABAS DE ALTERNÂNCIA DO GRÁFICO
================================================================ */
const initChartTabs = (data) => {
  const tabs = document.querySelectorAll('.chart-tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Remove active de todos
      tabs.forEach((t) => {
        t.classList.remove('chart-tab--active');
        t.setAttribute('aria-selected', 'false');
      });

      // Ativa o clicado
      tab.classList.add('chart-tab--active');
      tab.setAttribute('aria-selected', 'true');

      // Renderiza o gráfico correspondente
      const chartType = tab.getAttribute('data-chart');
      renderChart(chartType, data);
    });
  });
};

/* ================================================================
   IA INSIGHTS — geração automática com base nos dados
================================================================ */
const generateInsights = (data) => {
  const list = el('aiInsightsList');
  if (!list) return;

  const insights = [];

  // Insight 1 — conversão
  if (data.conversion < 5) {
    insights.push({
      icon: '📉',
      text: `A taxa de conversão está em <strong>${data.conversion}%</strong>. 
             Considere revisar os preços ou melhorar as fotos dos anúncios.`,
    });
  } else {
    insights.push({
      icon: '📈',
      text: `Taxa de conversão de <strong>${data.conversion}%</strong> — acima da média do setor (6-8%). 
             Continue com a estratégia atual!`,
    });
  }

  // Insight 2 — WhatsApp vs Leads
  const whatsappRate = ((data.whatsapp / data.views_data.at(-1)) * 100).toFixed(1);
  insights.push({
    icon: '💬',
    text: `<strong>${fmtNum(data.whatsapp)}</strong> cliques no WhatsApp este mês — 
           representando <strong>${whatsappRate}%</strong> dos visitantes. 
           WhatsApp é seu principal canal de conversão.`,
  });

  // Insight 3 — Estoque vs Vendas
  const monthsToSell = (data.stock / (data.soldMonth || 1)).toFixed(1);
  insights.push({
    icon: '🚗',
    text: `Com <strong>${data.stock} veículos</strong> em estoque e 
           <strong>${data.soldMonth} vendas</strong> este mês, o giro estimado é de 
           <strong>${monthsToSell} meses</strong> para zerar o estoque.`,
  });

  // Insight 4 — Faturamento
  const lastTwo = data.revenue_data.slice(-2);
  const growth  = (((lastTwo[1] - lastTwo[0]) / lastTwo[0]) * 100).toFixed(1);
  const trend   = growth >= 0 ? `cresceu ${growth}%` : `caiu ${Math.abs(growth)}%`;
  insights.push({
    icon: growth >= 0 ? '🔥' : '⚠️',
    text: `O faturamento <strong>${trend}</strong> em relação ao mês anterior. 
           Receita atual: <strong>${fmt(lastTwo[1])}</strong>.`,
  });

  // Insight 5 — Veículo mais visto
  insights.push({
    icon: '⭐',
    text: `O <strong>${data.topViewed}</strong> é o veículo mais visualizado do estoque. 
           Considere destacá-lo ou criar uma campanha específica para ele.`,
  });

  // Renderiza
  list.innerHTML = insights
    .map(
      (i) => `
      <div class="ai-insight-item">
        <span class="ai-insight-item__icon">${i.icon}</span>
        <p>${i.text}</p>
      </div>`
    )
    .join('');
};

/* ================================================================
   BUSCA DADOS REAIS DO SUPABASE
   (por enquanto usa mock, mas a estrutura está pronta para dados reais)
================================================================ */

/* ================================================================
   LÊ DADOS DO VEHICLES_DATA (vehicles-data.js do site principal)
   Como o admin está na subpasta /admin/, precisamos carregar
   o arquivo do diretório pai dinamicamente
================================================================ */
const loadVehiclesData = () => {
  return new Promise((resolve) => {

    // Se VEHICLES_DATA já está disponível (carregado via script tag)
    if (typeof VEHICLES_DATA !== 'undefined') {
      resolve(VEHICLES_DATA);
      return;
    }

    // Carrega dinamicamente do diretório pai
    const script = document.createElement('script');
    script.src = '../vehicles-data.js';
    script.onload = () => {
      if (typeof VEHICLES_DATA !== 'undefined') {
        resolve(VEHICLES_DATA);
      } else {
        resolve([]);
      }
    };
    script.onerror = () => resolve([]);
    document.head.appendChild(script);
  });
};

/* ================================================================
   CALCULA MÉTRICAS A PARTIR DO VEHICLES_DATA
================================================================ */
const calcFromVehiclesData = (vehicles) => {
  const now     = new Date();
  const mes     = now.getMonth();
  const ano     = now.getFullYear();

  const available  = vehicles.filter(v => v.status === 'available');
  const sold       = vehicles.filter(v => v.status === 'sold');
  const featured   = vehicles.filter(v => v.badge !== null);

  // Vendidos neste mês (usa updated_at se tiver, senão conta todos os sold)
  const soldThisMonth = sold.filter(v => {
    if (!v.updated_at) return true; // sem data, conta
    const d = new Date(v.updated_at);
    return d.getMonth() === mes && d.getFullYear() === ano;
  });

  const stockValue = available.reduce((sum, v) => sum + (v.price || 0), 0);
  const revenue    = sold.reduce((sum, v) => sum + (v.price || 0), 0);

  // Veículo com mais views (se tiver campo views, senão pega o primeiro)
  const topViewed = vehicles.reduce((top, v) =>
    (v.views || 0) > (top.views || 0) ? v : top,
    vehicles[0]
  );

  // Contagem por categoria
  const byCategory = {};
  available.forEach(v => {
    byCategory[v.category] = (byCategory[v.category] || 0) + 1;
  });

  // Contagem por marca (para gráfico)
  const byBrand = {};
  vehicles.forEach(v => {
    const brand = v.name?.split(' ')[0] || 'Outro';
    byBrand[brand] = (byBrand[brand] || 0) + 1;
  });

  return {
    stock:       available.length,
    stockValue,
    featured:    featured.length,
    soldMonth:   soldThisMonth.length,
    revenue,
    topViewed:   topViewed?.name || '—',

    // Dados para gráficos de marcas
    brands:       Object.keys(byBrand),
    brands_sales: Object.values(byBrand),

    // Status do estoque
    stock_available: available.length,
    stock_sold:      sold.length,
    stock_reserved:  vehicles.filter(v => v.status === 'reserved').length,
    stock_preparing: vehicles.filter(v => v.status === 'preparing').length,
  };
};

/* ================================================================
   BUSCA DADOS DO SUPABASE (leads, views, whatsapp)
   + combina com vehicles-data.js
================================================================ */

const fetchDashboardData = async () => {
  const mock = getMockData();

  try {
    // 1. Carrega vehicles-data.js
    const vehicles = await loadVehiclesData();
    if (vehicles.length > 0) {
      const calcs = calcFromVehiclesData(vehicles);
      Object.assign(mock, calcs);
    }

    // 2. Busca todos os analytics do Supabase
    const { data: events, error: eventsError } = await supabaseClient
      .from('analytics')
      .select('*');

    if (!eventsError && events && events.length > 0) {

      const now   = new Date();
      const mes   = now.getMonth();
      const ano   = now.getFullYear();

      // Filtra eventos deste mês
      const thisMonth = events.filter(e => {
        const d = new Date(e.created_at);
        return d.getMonth() === mes && d.getFullYear() === ano;
      });

      // Métricas gerais
      mock.views     = events.filter(e => e.event_type === 'page_view').length;
      mock.whatsapp  = events.filter(e => e.event_type === 'whatsapp_click').length;

      // Cliques nos cards (modal_open + card_click)
      const cardClicks = events.filter(e =>
        e.event_type === 'card_click' || e.event_type === 'modal_open'
      ).length;

      // Veículo mais visualizado
      const modalEvents = events.filter(e => e.event_type === 'modal_open' && e.vehicle_name);
      if (modalEvents.length > 0) {
        const countByVehicle = {};
        modalEvents.forEach(e => {
          countByVehicle[e.vehicle_name] = (countByVehicle[e.vehicle_name] || 0) + 1;
        });
        const topVehicle = Object.entries(countByVehicle)
          .sort((a, b) => b[1] - a[1])[0];
        if (topVehicle) mock.topViewed = topVehicle[0];
      }

      // Dados mensais para gráficos (últimos 6 meses)
      const months     = [];
      const viewsData  = [];
      const clicksData = [];
      const waData     = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(ano, mes - i, 1);
        const m = d.getMonth();
        const a = d.getFullYear();

        months.push(d.toLocaleDateString('pt-BR', { month: 'short' }));

        const monthEvents = events.filter(e => {
          const ed = new Date(e.created_at);
          return ed.getMonth() === m && ed.getFullYear() === a;
        });

        viewsData.push(
          monthEvents.filter(e => e.event_type === 'page_view').length
        );
        clicksData.push(
          monthEvents.filter(e =>
            e.event_type === 'card_click' || e.event_type === 'modal_open'
          ).length
        );
        waData.push(
          monthEvents.filter(e => e.event_type === 'whatsapp_click').length
        );
      }

      mock.months        = months;
      mock.views_data    = viewsData;
      mock.clicks_data   = clicksData;
      mock.whatsapp_data = waData;

      // Origem dos visitantes
      const originCount = {};
      events
        .filter(e => e.event_type === 'page_view')
        .forEach(e => {
          const o = e.origin || 'direto';
          originCount[o] = (originCount[o] || 0) + 1;
        });

      if (Object.keys(originCount).length > 0) {
        mock.origins       = Object.keys(originCount);
        mock.origins_leads = Object.values(originCount);
      }

      // Última atualização
      const lastEvent = events[events.length - 1];
      if (lastEvent) {
        mock.lastUpdate = new Date(lastEvent.created_at)
          .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
    }

    // 3. Busca leads do Supabase
    const { data: leads, error: leadsError } = await supabaseClient
      .from('leads')
      .select('id, status, origin, created_at');

    if (!leadsError && leads && leads.length > 0) {
      mock.leads = leads.length;
      const closed = leads.filter(l => l.status === 'closed').length;
      mock.conversion = parseFloat(
        ((closed / leads.length) * 100).toFixed(1)
      );

      // Leads por mês para gráfico
      const leadsData = mock.months.map((_, i) => {
        const d = new Date();
        const targetMonth = new Date(d.getFullYear(), d.getMonth() - (5 - i), 1);
        return leads.filter(l => {
          const ld = new Date(l.created_at);
          return ld.getMonth()    === targetMonth.getMonth() &&
                 ld.getFullYear() === targetMonth.getFullYear();
        }).length;
      });
      mock.leads_data = leadsData;
    }

    mock.lastUpdate = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    });

    return mock;

  } catch (err) {
    console.warn('Erro ao buscar dados:', err.message);
    return mock;
  }
};

/* ================================================================
   INIT DASHBOARD
================================================================ */
const initDashboard = async () => {
  try {
    // Busca dados
    const data = await fetchDashboardData();

    // Preenche métricas
    fillMetrics(data);

    // Inicia abas do gráfico
    initChartTabs(data);

    // Renderiza gráfico inicial (faturamento)
    renderChart('revenue', data);

    // Gera insights de IA
    generateInsights(data);

  } catch (err) {
    console.error('Erro ao inicializar dashboard:', err);
    AdminToast.show('Erro ao carregar dados do dashboard', 'error');
  }
};

// Inicia quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
  }

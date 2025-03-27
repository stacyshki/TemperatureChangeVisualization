const width = 960,
	height = 600

const container = d3
	.select('.geo-map')
	.style('display', 'flex')
	.style('flex-direction', 'column')
	.style('align-items', 'center')
	.style('font-family', 'Arial, sans-serif')

const title = container
	.append('h1')
	.text('Global temperature changes over time')

const svg = container.append('svg').attr('width', width).attr('height', height)

const projection = d3
	.geoNaturalEarth1()
	.scale(200)
	.translate([width / 2, height / 2])

const path = d3.geoPath().projection(projection)

async function loadCSV(filePath) {
	const data = await d3.csv(filePath)
	console.log('Loaded Data:', data)
	return data
}

const monthSelectContainer = container.append('div').style('margin', '14px')
const monthLabel = monthSelectContainer
	.append('label')
	.text('Select month: ')
	.style('font-size', '16px')
const monthSelect = monthSelectContainer
	.append('select')
	.style('font-size', '16px')

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]
months.forEach(month => {
	monthSelect.append('option').attr('value', month).text(month)
})

const yearSelectContainer = container.append('div').style('margin', '14px')
const yearLabel = yearSelectContainer
	.append('label')
	.text('Select year: ')
	.style('font-size', '16px')
const yearSlider = yearSelectContainer
	.append('input')
	.attr('type', 'range')
	.attr('min', 1961)
	.attr('max', 2019)
	.attr('value', 2019)
	.style('font-size', '16px')

// Display selected year dynamically
const yearDisplay = yearSelectContainer
	.append('span')
	.style('margin-left', '14px')
	.text(yearSlider.node().value)

yearSlider.on('input', function () {
	yearDisplay.text(this.value)
	const selectedYear = this.value
	const selectedMonth = monthSelect.node().value
	loadCSV('tables/temperatureChange.csv').then(data =>
		updateMap(data, selectedYear, selectedMonth)
	)
})

monthSelect.on('change', function () {
	const selectedMonth = this.value
	const selectedYear = yearSlider.node().value
	loadCSV('tables/temperatureChange.csv').then(data =>
		updateMap(data, selectedYear, selectedMonth)
	)
})

async function updateMap(data, selectedYear, selectedMonth) {
	svg.selectAll('path').remove()

	console.log('Selected Year:', selectedYear)
	console.log('Selected Month:', selectedMonth)

	const filteredData = data.filter(d => {
		const yearMatches = d['Year'] === selectedYear
		const monthMatches = d['Months'] === selectedMonth
		return yearMatches && monthMatches
	})

	console.log('Filtered Data:', filteredData)

	const colorScale = d3
		.scaleSequential(d3.interpolateRdBu)
		.domain(d3.extent(filteredData, d => +d['Temperature Change']).reverse())

	// Load the GeoJSON countries data
	const world = await d3.json(
		'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
	)
	const countries = topojson.feature(world, world.objects.countries).features

	const normalizeName = name => {
		if (name === 'Russian Federation') return 'Russia'
		if (name === 'Bolivia (Plurinational State of)') return 'Bolivia'
		if (name === 'Venezuela (Bolivarian Republic of)') return 'Venezuela'
		if (name === 'Dominican Republic') return 'Dominican Rep.'
		if (name === 'Falkland Islands (Malvinas)') return 'Falkland Is.'
		if (name === 'French Southern and Antarctic Territories')
			return 'Fr. S. Antarctic Lands'
		if (name === 'United Republic of Tanzania') return 'Tanzania'
		if (name === 'Congo') return 'Dem. Rep. Congo'
		if (name === 'Equatorial Guinea') return 'Eq. Guinea'
		if (name === 'Eswatini') return 'eSwatini'
		if (name === 'South Sudan') return 'S. Sudan'
		if (name === 'Central African Republic') return 'Central African Rep.'
		if (name === 'Western Sahara') return 'W. Sahara'
		if (name === 'Iran (Islamic Republic of)') return 'Iran'
		if (name === 'Syrian Arab Republic') return 'Syria'
		if (name === 'North Macedonia') return 'Macedonia'
		if (name === 'Bosnia and Herzegovina') return 'Bosnia and Herz.'
		if (name === 'Republic of Moldova') return 'Moldova'
		if (name === "Lao People's Democratic Republic") return 'Laos'
		if (name === 'Viet Nam') return 'Vietnam'
		if (name === 'China, Taiwan Province of') return 'Taiwan'
		if (name === "Democratic People's Republic of Korea") return 'North Korea'
		if (name === 'Republic of Korea') return 'South Korea'
		if (name === 'Brunei Darussalam') return 'Brunei'
		return name
	}

	svg
		.selectAll('path')
		.data(countries)
		.enter()
		.append('path')
		.attr('d', path)
		.attr('fill', d => {
			const regionName = normalizeName(d.properties.name)

			const regionData = filteredData.find(
				f => normalizeName(f.Area) === regionName
			)
			if (regionData) {
				return colorScale(+regionData['Temperature Change'])
			}
			return '#ccc'
		})
		.attr('stroke', '#444')
		.attr('stroke-width', 1)
		.append('title')
		.text(d => {
			const regionName = normalizeName(d.properties.name)
			const regionData = filteredData.find(
				f => normalizeName(f.Area) === regionName
			)
			if (regionData) {
				return `Area: ${d.properties.name}\nTemp Change: ${regionData['Temperature Change']}°C`
			}
			return `Area: ${d.properties.name}`
		})
}

loadCSV('tables/temperatureChange.csv').then(data =>
	updateMap(data, '2019', 'January')
)

d3.csv('tables/temperatureChange.csv').then(function (data) {
	const graphContainer = d3.select('#graph1')
	graphContainer.html('')

	const containerWidth = graphContainer.node().getBoundingClientRect().width
	const containerHeight =
		graphContainer.node().getBoundingClientRect().height || 470

	const margin = { top: 20, right: 30, bottom: 50, left: 60 }
	const width = containerWidth - margin.left - margin.right
	const height = containerHeight - margin.top - margin.bottom

	const svg = graphContainer
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`)

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', 0)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('font-weight', 'bold')
		.style('fill', '#444')
		.text('Global average temperature change over time')

	data.forEach(d => {
		d.Year = +d.Year
		d['Temperature Change'] = +d['Temperature Change']
	})

	const avgByYear = d3.rollups(
		data.filter(d => !isNaN(d['Temperature Change'])),
		v => d3.mean(v, d => d['Temperature Change']),
		d => d.Year
	)
	const globalAverages = avgByYear
		.map(([year, value]) => ({ year, value }))
		.sort((a, b) => a.year - b.year)

	console.log('Global Averages:', globalAverages)

	const x = d3
		.scaleLinear()
		.domain(d3.extent(globalAverages, d => d.year))
		.range([0, width])

	const y = d3
		.scaleLinear()
		.domain(d3.extent(globalAverages, d => d.value))
		.range([height, 0])

	const line = d3
		.line()
		.x(d => x(d.year))
		.y(d => y(d.value))

	svg
		.append('path')
		.datum(globalAverages)
		.attr('fill', 'none')
		.attr('stroke', 'steelblue')
		.attr('stroke-width', 2)
		.attr('d', line)

	// axis
	svg
		.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(d3.axisBottom(x).tickFormat(d3.format('d')))

	svg.append('g').call(d3.axisLeft(y))

	// x axis
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', width / 2)
		.attr('y', height + margin.bottom - 5)
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Year')

	// y axis
	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', `rotate(-90)`)
		.attr('x', -height / 2)
		.attr('y', -margin.left + 15)
		.text('Average temperature change (°C)')
		.style('font-size', '16px')
		.style('fill', '#444')
})

d3.csv('tables/globalAvgStd.csv').then(function (data) {
	const graphContainer = d3.select('#graph3')
	graphContainer.html('')

	const containerWidth = graphContainer.node().getBoundingClientRect().width
	const containerHeight =
		graphContainer.node().getBoundingClientRect().height || 470

	const margin = { top: 20, right: 30, bottom: 50, left: 60 }
	const width = containerWidth - margin.left - margin.right
	const height = containerHeight - margin.top - margin.bottom

	const svg = graphContainer
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`)

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', -5)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('font-weight', 'bold')
		.style('fill', '#444')
		.text('Global average standard deviation change over time')

	data.forEach(d => {
		d.Year = +d.Year
		d['Standard Deviation'] = +d['Standard Deviation']
	})

	data.sort((a, b) => a.Year - b.Year)

	console.log('Parsed Data:', data)

	const x = d3
		.scaleLinear()
		.domain(d3.extent(data, d => d.Year))
		.range([0, width])

	const y = d3
		.scaleLinear()
		.domain([
			d3.min(data, d => d['Standard Deviation']),
			d3.max(data, d => d['Standard Deviation']),
		])
		.range([height, 0])

	const line = d3
		.line()
		.x(d => x(d.Year))
		.y(d => y(d['Standard Deviation']))
		.curve(d3.curveMonotoneX)

	svg
		.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', 'steelblue')
		.attr('stroke-width', 2)
		.attr('d', line)

	svg
		.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(d3.axisBottom(x).tickFormat(d3.format('d')))

	svg.append('g').call(d3.axisLeft(y))

	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', width / 2)
		.attr('y', height + margin.bottom - 5)
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Year')

	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', `rotate(-90)`)
		.attr('x', -height / 2)
		.attr('y', -margin.left + 15)
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Average standard deviation change')
})

d3.csv('tables/stdDescYear.csv').then(function (data) {
	const graphContainer = d3.select('#graph4')
	graphContainer.html('')

	const containerWidth = graphContainer.node().getBoundingClientRect().width
	const containerHeight =
		graphContainer.node().getBoundingClientRect().height || 470

	const margin = { top: 40, right: 30, bottom: 50, left: 60 }
	const width = containerWidth - margin.left - margin.right
	const height = containerHeight - margin.top - margin.bottom

	const svg = graphContainer
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`)

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', -10)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('font-weight', 'bold')
		.style('fill', '#444')
		.text('Unusual years with extreme temperature deviation')

	data.forEach(d => {
		d.Year = +d.Year
		d.mean = +d.mean
	})

	data.sort((a, b) => a.Year - b.Year)

	const Q1 = d3.quantile(
		data.map(d => d.mean),
		0.25
	)
	const Q3 = d3.quantile(
		data.map(d => d.mean),
		0.75
	)
	const IQR = Q3 - Q1
	const lower_bound = Q1 - 1.5 * IQR
	const upper_bound = Q3 + 1.5 * IQR

	const outliers = data.filter(
		d => d.mean < lower_bound || d.mean > upper_bound
	)

	const overallMean = d3.mean(data, d => d.mean)

	const x = d3
		.scaleLinear()
		.domain(d3.extent(data, d => d.Year))
		.range([0, width])

	const y = d3.scaleLinear().domain([0.72, 0.74]).range([height, 0])

	const line = d3
		.line()
		.x(d => x(d.Year))
		.y(d => y(d.mean))
		.curve(d3.curveLinear)

	// Draw mean temperature line
	svg
		.append('path')
		.datum(data)
		.attr('fill', 'none')
		.attr('stroke', 'steelblue')
		.attr('stroke-width', 2)
		.attr('d', line)

	// Draw outlier points (red dots)
	svg
		.selectAll('.outlier')
		.data(outliers)
		.enter()
		.append('circle')
		.attr('class', 'outlier')
		.attr('cx', d => x(d.Year))
		.attr('cy', d => y(d.mean))
		.attr('r', 5)
		.attr('fill', 'red')

	// Add overall mean temperature line
	svg
		.append('line')
		.attr('x1', 0)
		.attr('y1', y(overallMean))
		.attr('x2', width)
		.attr('y2', y(overallMean))
		.attr('stroke', 'gray')
		.attr('stroke-dasharray', '6,6')
		.attr('stroke-width', 2)

	svg
		.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(d3.axisBottom(x).tickFormat(d3.format('d')))

	svg.append('g').call(d3.axisLeft(y))

	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', width / 2)
		.attr('y', height + margin.bottom - 5)
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Year')

	svg
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('transform', `rotate(-90)`)
		.attr('x', -height / 2)
		.attr('y', -margin.left + 15)
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Mean temperature')

	const legend = svg
		.append('g')
		.attr('transform', `translate(${width - 150}, 10)`)

	legend
		.append('circle')
		.attr('cx', 10)
		.attr('cy', 10)
		.attr('r', 5)
		.attr('fill', 'red')
	legend
		.append('text')
		.attr('x', 20)
		.attr('y', 15)
		.text('IQR outliers')
		.style('font-size', '14px')

	legend
		.append('line')
		.attr('x1', 0)
		.attr('y1', 30)
		.attr('x2', 20)
		.attr('y2', 30)
		.attr('stroke', 'gray')
		.attr('stroke-dasharray', '6,6')
		.attr('stroke-width', 2)
	legend
		.append('text')
		.attr('x', 25)
		.attr('y', 35)
		.text('Mean temperature')
		.style('font-size', '14px')
})

d3.csv('tables/globalTempAvg.csv').then(function (data) {
	const graphContainer = d3.select('#graph2')
	graphContainer.html('')

	const containerWidth = graphContainer.node().getBoundingClientRect().width
	const containerHeight =
		graphContainer.node().getBoundingClientRect().height || 500

	const margin = { top: 50, right: 50, bottom: 60, left: 70 }
	const width = containerWidth - margin.left - margin.right
	const height = containerHeight - margin.top - margin.bottom

	const svg = graphContainer
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`)

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', -10)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('font-weight', 'bold')
		.style('fill', '#444')
		.text('Global temperature change trend (1961-2019)')

	// Convert columns to numbers
	data.forEach(d => {
		d.Year = +d.Year
		d['Temperature Change'] = +d['Temperature Change']
	})

	data.sort((a, b) => a.Year - b.Year)

	const xValues = data.map(d => d.Year)
	const yValues = data.map(d => d['Temperature Change'])

	const regression = ss.linearRegression(xValues.map((x, i) => [x, yValues[i]]))
	const regressionLine = ss.linearRegressionLine(regression)

	const polyFit = ss.linearRegression(xValues.map((x, i) => [x, yValues[i]]))
	const poly = x => regressionLine(x)

	const x0 = d3.range(
		Math.max(1955, d3.min(xValues)),
		Math.min(2050, d3.max(xValues)),
		1
	)

	const hy0 = x0.map(poly)

	const xMean = d3.mean(xValues)
	const xVar = d3.variance(xValues)
	const v0 = x0.map(x => (xVar + (x - xMean) ** 2) / (xValues.length * xVar))

	const residuals = yValues.map((y, i) => y - regressionLine(xValues[i]))
	const sse = d3.sum(residuals.map(e => e ** 2))
	const hs2 = sse / (xValues.length - 2)

	const alpha = 0.05
	const t = jStat.studentt.inv(1 - alpha / 2, xValues.length - 2)
	const eps_mean = v0.map(v => t * Math.sqrt(hs2 * v))
	const eps_pred = v0.map(v => t * Math.sqrt(hs2 * (1 + v)))

	const mean_l0 = hy0.map((y, i) => y - eps_mean[i])
	const mean_up = hy0.map((y, i) => y + eps_mean[i])
	const val_l0 = hy0.map((y, i) => y - eps_pred[i])
	const val_up = hy0.map((y, i) => y + eps_pred[i])

	const x = d3.scaleLinear().domain(d3.extent(xValues)).range([0, width])

	const y = d3
		.scaleLinear()
		.domain([d3.min(val_l0) - 0.1, d3.max(val_up) + 0.1])
		.range([height, 0])

	svg
		.append('g')
		.attr('transform', `translate(0,${height})`)
		.call(d3.axisBottom(x).tickFormat(d3.format('d')))

	svg.append('g').call(d3.axisLeft(y))

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', height + margin.bottom - 10)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Year')

	svg
		.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('x', -height / 2)
		.attr('y', -margin.left + 15)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Global average temperature change (°C)')

	// Confidence interval
	svg
		.append('path')
		.datum(x0.map((x, i) => ({ x, y1: mean_l0[i], y2: mean_up[i] })))
		.attr('fill', 'lightblue')
		.attr('opacity', 0.4)
		.attr(
			'd',
			d3
				.area()
				.x(d => x(d.x))
				.y0(d => y(d.y1))
				.y1(d => y(d.y2))
		)

	// Prediction interval
	svg
		.append('path')
		.datum(x0.map((x, i) => ({ x, y1: val_l0[i], y2: val_up[i] })))
		.attr('fill', 'lightgreen')
		.attr('opacity', 0.3)
		.attr(
			'd',
			d3
				.area()
				.x(d => x(d.x))
				.y0(d => y(d.y1))
				.y1(d => y(d.y2))
		)

	// Regression line
	svg
		.append('path')
		.datum(x0.map(x => ({ x, y: poly(x) })))
		.attr('fill', 'none')
		.attr('stroke', 'red')
		.attr('stroke-width', 2)
		.attr(
			'd',
			d3
				.line()
				.x(d => x(d.x))
				.y(d => y(d.y))
		)

	// Scatterplot for observed data
	svg
		.selectAll('.dot')
		.data(data)
		.enter()
		.append('circle')
		.attr('class', 'dot')
		.attr('cx', d => x(d.Year))
		.attr('cy', d => y(d['Temperature Change']))
		.attr('r', 4)
		.attr('fill', 'darkblue')

	const legend = svg
		.append('g')
		.attr('transform', `translate(${width - 180}, -50)`)

	legend
		.append('circle')
		.attr('cx', 10)
		.attr('cy', 10)
		.attr('r', 5)
		.attr('fill', 'darkblue')
	legend
		.append('text')
		.attr('x', 20)
		.attr('y', 15)
		.text('Observed data')
		.style('fill', '#444')
		.style('font-size', '14px')

	legend
		.append('line')
		.attr('x1', 0)
		.attr('y1', 30)
		.attr('x2', 20)
		.attr('y2', 30)
		.attr('stroke', 'red')
		.attr('stroke-width', 2)
	legend
		.append('text')
		.attr('x', 25)
		.attr('y', 35)
		.text('Regression line')
		.style('fill', '#444')
		.style('font-size', '14px')

	legend
		.append('rect')
		.attr('x', 0)
		.attr('y', 50)
		.attr('width', 20)
		.attr('height', 10)
		.attr('fill', 'lightblue')
		.attr('opacity', 0.4)
	legend
		.append('text')
		.attr('x', 25)
		.attr('y', 60)
		.text('Confidence interval (mean)')
		.style('fill', '#444')
		.style('font-size', '14px')

	legend
		.append('rect')
		.attr('x', 0)
		.attr('y', 70)
		.attr('width', 20)
		.attr('height', 10)
		.attr('fill', 'lightgreen')
		.attr('opacity', 0.3)
	legend
		.append('text')
		.attr('x', 25)
		.attr('y', 80)
		.text('Prediction interval (individual)')
		.style('fill', '#444')
		.style('font-size', '14px')
})

d3.csv('tables/temperatureChange.csv').then(function (data) {
	const graphContainer = d3.select('#final-graph')
	graphContainer.html('')

	const countries = [...new Set(data.map(d => d.Area))].sort()

	const dropdown = graphContainer
		.append('select')
		.style('margin-bottom', '14px')
		.style('font-size', '16px')
		.on('change', function () {
			updateChart(this.value)
		})

	dropdown
		.selectAll('option')
		.data(countries)
		.enter()
		.append('option')
		.text(d => d)
		.attr('value', d => d)

	const margin = { top: 40, right: 30, bottom: 50, left: 60 }
	const width =
		graphContainer.node().getBoundingClientRect().width -
		margin.left -
		margin.right
	const height = 400 - margin.top - margin.bottom

	const svg = graphContainer
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`)

	const x = d3.scaleLinear().range([0, width])
	const y = d3.scaleLinear().range([height, 0])

	const xAxis = svg.append('g').attr('transform', `translate(0,${height})`)
	const yAxis = svg.append('g')

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', -10)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('font-weight', 'bold')
		.style('fill', '#444')
		.text('Temperature change over time by country')

	svg
		.append('text')
		.attr('x', width / 2)
		.attr('y', height + margin.bottom - 5)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Year')

	svg
		.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('x', -height / 2)
		.attr('y', -margin.left + 15)
		.attr('text-anchor', 'middle')
		.style('font-size', '16px')
		.style('fill', '#444')
		.text('Temperature change (°C)')

	const line = d3
		.line()
		.defined(d => !isNaN(d.value))
		.x(d => x(d.year))
		.y(d => y(d.value))
		.curve(d3.curveMonotoneX)

	function updateChart(selectedCountry) {
		const countryData = data
			.filter(
				d => d.Area === selectedCountry && !isNaN(d['Temperature Change'])
			)
			.map(d => ({
				year: +d.Year,
				value: +d['Temperature Change'],
			}))
			.sort((a, b) => a.year - b.year)

		const allYears = d3.range(
			d3.min(countryData, d => d.year),
			d3.max(countryData, d => d.year) + 1
		)
		const filledData = allYears.map(year => ({
			year,
			value: countryData.find(d => d.year === year)?.value ?? null,
		}))

		x.domain(d3.extent(filledData, d => d.year))
		y.domain(
			d3.extent(
				filledData.filter(d => d.value !== null),
				d => d.value
			)
		)

		xAxis
			.transition()
			.duration(1000)
			.call(d3.axisBottom(x).tickFormat(d3.format('d')))
		yAxis.transition().duration(1000).call(d3.axisLeft(y))

		const path = svg.selectAll('.line').data([filledData])

		path
			.enter()
			.append('path')
			.attr('class', 'line')
			.merge(path)
			.transition()
			.duration(1000)
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 2)
			.attr('d', line)

		path.exit().remove()
	}
	updateChart(countries[0])
})

document.addEventListener('DOMContentLoaded', function () {
	const thumbnails = document.querySelectorAll('.chart-thumbnail')

	thumbnails.forEach(thumbnail => {
		thumbnail.addEventListener('click', function () {
			const graphId = this.getAttribute('onclick').match(/'([^']+)'/)[1]

			document.querySelectorAll('.chart-container').forEach(chart => {
				chart.classList.remove('active')
			})

			// Show the selected graph
			document.getElementById(graphId).classList.add('active')
		})
	})

	// Load the first graph by default
	document.getElementById('graph10').classList.add('active')

	function drawGraph5() {
		d3.csv('tables/globalTempChangeByMonth.csv').then(data => {
			const graphContainer = d3.select('#graph5')
			graphContainer.html('')

			const containerWidth = graphContainer.node().getBoundingClientRect().width
			const containerHeight =
				graphContainer.node().getBoundingClientRect().height || 470
			const margin = { top: 40, right: 30, bottom: 100, left: 90 }
			const width = containerWidth - margin.left - margin.right
			const height = containerHeight - margin.top - margin.bottom

			const svg = graphContainer
				.append('svg')
				.attr('width', containerWidth)
				.attr('height', containerHeight)
			const chart = svg
				.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`)

			data.forEach(d => (d['Temperature Change'] = +d['Temperature Change']))

			const x = d3
				.scaleBand()
				.domain(data.map(d => d.Month))
				.range([0, width])
				.padding(0.2)
			chart
				.append('text')
				.attr('x', width / 2)
				.attr('y', height + 90)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Month')

			const y = d3
				.scaleLinear()
				.domain([0, d3.max(data, d => d['Temperature Change'])])
				.nice()
				.range([height, 0])
			chart
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -height / 2)
				.attr('y', -margin.left + 30)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Average temperature change (°C)')

			const color = d3
				.scaleSequential()
				.domain([0, data.length - 1])
				.interpolator(d3.interpolateRainbow)

			chart
				.append('g')
				.attr('transform', `translate(0, ${height})`)
				.call(d3.axisBottom(x))
				.selectAll('text')
				.attr('transform', 'rotate(-45)')
				.attr('dy', '0.6em')
				.attr('dx', '-0.6em')
				.style('text-anchor', 'end')
				.style('fill', '#444')
				.style('font-size', '14px')

			chart
				.append('g')
				.call(d3.axisLeft(y))
				.selectAll('text')
				.style('fill', '#444')
				.style('font-size', '14px')

			chart
				.selectAll('.bar')
				.data(data)
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('x', d => x(d.Month))
				.attr('y', d => y(d['Temperature Change']))
				.attr('width', x.bandwidth())
				.attr('height', d => height - y(d['Temperature Change']))
				.attr('fill', (d, i) => color(i))
		})
	}

	function drawGraph6() {
		d3.csv('tables/globalStdChangeByMonth.csv').then(data => {
			const graphContainer = d3.select('#graph6')
			graphContainer.html('')

			const containerWidth = graphContainer.node().getBoundingClientRect().width
			const containerHeight =
				graphContainer.node().getBoundingClientRect().height || 470
			const margin = { top: 40, right: 30, bottom: 100, left: 90 }
			const width = containerWidth - margin.left - margin.right
			const height = containerHeight - margin.top - margin.bottom

			const svg = graphContainer
				.append('svg')
				.attr('width', containerWidth)
				.attr('height', containerHeight)

			const chart = svg
				.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`)

			data.forEach(d => (d['Standard Deviation'] = +d['Standard Deviation']))

			const x = d3
				.scaleBand()
				.domain(data.map(d => d.Month))
				.range([0, width])
				.padding(0.2)
			chart
				.append('text')
				.attr('x', width / 2)
				.attr('y', height + 90)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Month')

			const y = d3
				.scaleLinear()
				.domain([0, d3.max(data, d => d['Standard Deviation'])])
				.nice()
				.range([height, 0])
			chart
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -height / 2)
				.attr('y', -margin.left + 30)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Average standard deviation')

			const color = d3
				.scaleSequential()
				.domain([0, data.length - 1])
				.interpolator(d3.interpolateRainbow)

			chart
				.append('g')
				.attr('transform', `translate(0, ${height})`)
				.call(d3.axisBottom(x))
				.selectAll('text')
				.attr('transform', 'rotate(-45)')
				.attr('dy', '0.6em')
				.attr('dx', '-0.6em')
				.style('text-anchor', 'end')
				.style('fill', '#444')
				.style('font-size', '14px')

			chart
				.append('g')
				.call(d3.axisLeft(y))
				.selectAll('text')
				.style('fill', '#444')
				.style('font-size', '14px')

			chart
				.selectAll('.bar')
				.data(data)
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('x', d => x(d.Month))
				.attr('y', d => y(d['Standard Deviation']))
				.attr('width', x.bandwidth())
				.attr('height', d => height - y(d['Standard Deviation']))
				.attr('fill', (d, i) => color(i))
		})
	}

	function drawGraph7() {
		d3.csv('tables/temperatureChange.csv').then(function (data) {
			const graphContainer = d3.select('#graph7')
			graphContainer.html('')

			const containerWidth = graphContainer.node().getBoundingClientRect().width
			const containerHeight =
				graphContainer.node().getBoundingClientRect().height || 470
			const margin = { top: 40, right: 30, bottom: 50, left: 60 }
			const width = containerWidth - margin.left - margin.right
			const height = containerHeight - margin.top - margin.bottom

			const svg = graphContainer
				.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`)

			data.forEach(d => {
				d.Year = +d.Year
				d['Temperature Change'] = +d['Temperature Change']
			})

			const avgByYear = d3.rollups(
				data.filter(d => !isNaN(d['Temperature Change'])),
				v => d3.mean(v, d => d['Temperature Change']),
				d => d.Year
			)
			const globalAverages = avgByYear
				.map(([year, value]) => ({ year, value }))
				.sort((a, b) => a.year - b.year)

			const x = d3
				.scaleBand()
				.domain(globalAverages.map(d => d.year))
				.range([0, width])
				.padding(0.1)

			const y = d3
				.scaleLinear()
				.domain([0, d3.max(globalAverages, d => d.value)])
				.range([height, 0])

			svg
				.selectAll('.bar')
				.data(globalAverages)
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('x', d => x(d.year))
				.attr('y', d => y(d.value))
				.attr('width', x.bandwidth())
				.attr('height', d => height - y(d.value))
				.attr('fill', 'tomato')

			svg
				.append('g')
				.attr('transform', `translate(0,${height})`)
				.call(d3.axisBottom(x).tickValues(x.domain().filter(d => d % 5 === 0)))

			svg.append('g').call(d3.axisLeft(y))

			svg
				.append('text')
				.attr('text-anchor', 'middle')
				.attr('transform', `rotate(-90)`)
				.attr('x', -height / 2)
				.attr('y', -margin.left + 15)
				.text('Average temperature change (°C)')
				.style('font-size', '16px')
				.style('fill', '#444')

			svg
				.append('text')
				.attr('x', width / 2)
				.attr('y', height + margin.bottom - 5)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Year')
		})
	}
	function drawGraph8() {
		const container = d3.select('#graph8')
		container.html('')
		container.style('height', 'auto').style('overflow', 'visible')

		container.attr('class', 'chart-container graph')

		const controls = container.append('div').attr('id', 'controls8')

		controls
			.append('label')
			.attr('for', 'country-select8')
			.style('margin-right', '6px')
			.text('Country:')

		const select = controls
			.append('select')
			.attr('id', 'country-select8')
			.style('font-size', '14px')
			.style('padding', '4px 6px')

		const tooltip = container
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0)
			.style('position', 'absolute')
			.style('background', 'rgba(0,0,0,0.7)')
			.style('color', 'white')
			.style('padding', '6px 10px')
			.style('border-radius', '5px')
			.style('pointer-events', 'none')
			.style('font-size', '12px')

		const width = 1425
		const height = 520
		const margin = { top: 30, right: 60, bottom: 40, left: 60 }

		const svg = container
			.append('svg')
			.attr('width', width)
			.attr('height', height)

		const bubbleGroup = svg.append('g').attr('class', 'bubbles')

		d3.csv('tables/globalStdToTem.csv').then(raw => {
			const data = raw
				.map(d => ({
					tempChange: +d['Temperature Change'],
					stdDev: +d['Standard Deviation'],
					Area: d.Area,
					Year: d.Year,
					Months: d.Months,
				}))
				.filter(d => !isNaN(d.tempChange) && !isNaN(d.stdDev))

			const maxStdDev = d3.max(data, d => d.stdDev)
			const xScale = d3
				.scaleLinear()
				.domain([-5.2, 5.2])
				.range([margin.left, width - margin.right])
			const yScale = d3
				.scaleLinear()
				.domain([0, maxStdDev + 0.5])
				.range([height - margin.bottom, margin.top])

			const xAxis = d3.axisBottom(xScale).ticks(10)
			const yAxis = d3.axisLeft(yScale).ticks(10)

			svg
				.append('g')
				.attr('transform', `translate(0, ${height - margin.bottom})`)
				.call(xAxis)
				.append('text')
				.attr('x', (width - margin.left - margin.right) / 2 + margin.left)
				.attr('y', 35)
				.attr('fill', '#444')
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.text('Temperature change')

			svg
				.append('g')
				.attr('transform', `translate(${margin.left}, 0)`)
				.call(yAxis)
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -height / 2)
				.attr('y', -45)
				.attr('fill', '#444')
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.text('Standard deviation')

			const legend = svg
				.append('g')
				.attr('transform', `translate(${width - 60},${margin.top})`)

			const legendScale = d3.scaleLinear().range([100, 0])
			const legendAxis = d3.axisRight(legendScale).ticks(5)

			const defs = svg.append('defs')
			const linearGradient = defs
				.append('linearGradient')
				.attr('id', 'legend-gradient')
				.attr('x1', '0%')
				.attr('y1', '100%')
				.attr('x2', '0%')
				.attr('y2', '0%')

			linearGradient
				.selectAll('stop')
				.data(d3.range(0, 1.1, 0.1))
				.enter()
				.append('stop')
				.attr('offset', d => `${d * 100}%`)
				.attr('stop-color', 'white')

			legend
				.append('rect')
				.attr('width', 20)
				.attr('height', 100)
				.style('fill', 'url(#legend-gradient)')

			legend
				.append('g')
				.attr('transform', 'translate(20, 0)')
				.attr('class', 'legend-axis')

			svg
				.select('.legend-axis')
				.call(legendAxis)
				.selectAll('text')
				.style('font-size', '14px')
				.style('fill', '#444')

			const countries = Array.from(new Set(data.map(d => d.Area))).sort()
			select.append('option').attr('value', 'All').text('Globally')
			countries.forEach(country => {
				select.append('option').attr('value', country).text(country)
			})

			select.on('change', () => {
				const selected = select.property('value')
				const filtered =
					selected === 'All' ? data : data.filter(d => d.Area === selected)
				drawBubbles(filtered)
			})

			drawBubbles(data)

			function drawBubbles(data) {
				bubbleGroup.selectAll('*').remove()

				const bins = {}
				data.forEach(d => {
					const key = `${Math.round(d.tempChange * 10)},${Math.round(
						d.stdDev * 10
					)}`
					if (!bins[key]) bins[key] = { count: 0, items: [] }
					bins[key].count += 1
					bins[key].items.push(d)
				})

				const bubbles = Object.entries(bins).map(([key, value]) => {
					const [xBin, yBin] = key.split(',').map(Number)
					return {
						x: xScale(xBin / 10),
						y: yScale(yBin / 10),
						count: value.count,
						items: value.items,
					}
				})

				const colorScale = d3
					.scaleSequential(d3.interpolateYlOrRd)
					.domain([1, d3.max(bubbles, d => d.count)])

				legendScale.domain([1, d3.max(bubbles, d => d.count)])
				svg.select('.legend-axis').call(legendAxis)
				linearGradient
					.selectAll('stop')
					.data(d3.range(0, 1.1, 0.1))
					.attr('stop-color', d =>
						colorScale(1 + d * (d3.max(bubbles, d => d.count) - 1))
					)

				bubbleGroup
					.selectAll('circle')
					.data(bubbles)
					.enter()
					.append('circle')
					.attr('cx', d => d.x)
					.attr('cy', d => d.y)
					.attr('r', 0)
					.attr('fill', d => colorScale(d.count))
					.attr('opacity', 0.7)
					.on('mouseover', (event, d) => {
						const sample = d.items[0]
						tooltip.style('opacity', 1).html(
							`<strong>${sample.Area}</strong><br>
					Year: ${sample.Year}<br>
					Month: ${sample.Months}<br>
					Temp Change: ${sample.tempChange}<br>
					Std Dev: ${sample.stdDev}`
						)
					})
					.on('mousemove', event => {
						tooltip
							.style('left', event.pageX + 10 + 'px')
							.style('top', event.pageY - 30 + 'px')
					})
					.on('mouseout', () => tooltip.style('opacity', 0))
					.transition()
					.duration(1000)
					.attr('r', d => Math.min(20, d.count * 2 + 4))
			}
		})
	}

	function drawGraph9() {
		const container = d3.select('#graph9')
		container.html('').style('width', '1450px')

		const margin = { top: 60, right: 60, bottom: 50, left: 60 },
			width = 1450 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom

		const svg = container
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`)

		const tooltip = d3
			.select('body') // Placing tooltip in body to prevent hiding issues
			.append('div')
			.style('position', 'absolute')
			.style('background', 'rgba(0,0,0,0.85)')
			.style('color', '#fff')
			.style('padding', '6px 10px')
			.style('border-radius', '5px')
			.style('font-size', '14px')
			.style('pointer-events', 'none')
			.style('opacity', 0)
			.style('z-index', '1000')

		d3.csv('tables/importantAreasTemp.csv').then(data => {
			data.forEach(d => {
				d.Year = +d.Year
				d['Temperature Change'] = d['Temperature Change']
					? +d['Temperature Change']
					: null
			})

			const areas = Array.from(new Set(data.map(d => d.Area))).sort()
			const color = d3.scaleOrdinal(d3.schemeCategory10).domain(areas)
			const nested = d3.groups(data, d => d.Area)

			const xScale = d3
				.scaleLinear()
				.domain(d3.extent(data, d => d.Year))
				.range([0, width])

			const yScale = d3
				.scaleLinear()
				.domain(
					d3.extent(
						data.filter(d => d['Temperature Change'] !== null),
						d => d['Temperature Change']
					)
				)
				.nice()
				.range([height, 0])

			const line = d3
				.line()
				.defined(d => d['Temperature Change'] !== null)
				.x(d => xScale(d.Year))
				.y(d => yScale(d['Temperature Change']))

			svg
				.append('g')
				.attr('transform', `translate(0, ${height})`)
				.call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')))
				.selectAll('text')
				.style('fill', '#444')
				.style('font-size', '13px')

			svg
				.append('g')
				.call(d3.axisLeft(yScale))
				.selectAll('text')
				.style('fill', '#444')
				.style('font-size', '13px')

			svg
				.append('text')
				.attr('x', width / 2)
				.attr('y', height + 40)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Year')

			svg
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -height / 2)
				.attr('y', -45)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Temperature change (°C)')

			const lines = svg
				.selectAll('.line')
				.data(nested)
				.enter()
				.append('path')
				.attr('class', 'line')
				.attr('fill', 'none')
				.attr('stroke', d => color(d[0]))
				.attr('stroke-width', 1.5)
				.attr('d', d => line(d[1]))
				.attr('opacity', 0.8)

			lines
				.on('mouseover', function (event, d) {
					d3.selectAll('.line').attr('opacity', 0.2)
					d3.select(this).attr('stroke-width', 4).attr('opacity', 1)

					tooltip
						.style('opacity', 1)
						.html(`<strong>${d[0]}</strong>`)
						.style('left', event.pageX + 15 + 'px')
						.style('top', event.pageY - 20 + 'px')
				})
				.on('mousemove', function (event) {
					tooltip
						.style('left', event.pageX + 15 + 'px')
						.style('top', event.pageY - 20 + 'px')
				})
				.on('mouseout', function () {
					d3.selectAll('.line').attr('opacity', 0.8)
					d3.select(this).attr('stroke-width', 1.5)
					tooltip.style('opacity', 0)
				})
		})
	}

	function drawGraph10() {
		d3.select('#graph10').html('')
		d3.csv('tables/Global_Temp_Change_By_Month_Every_Year_1.csv').then(data => {
			const slider = d3
				.select('#graph10')
				.append('input')
				.attr('type', 'range')
				.attr('min', 1961)
				.attr('max', 2019)
				.attr('value', 1961)
				.attr('id', 'radarSlider')

			const sliderLabel = d3
				.select('#graph10')
				.append('label')
				.attr('for', 'radarSlider')
				.style('margin-left', '10px')
				.text('Year: 1961')

			// Draw chart for selected year
			slider.on('input', function () {
				const year = +this.value
				sliderLabel.text('Year: ' + year)
				drawRadarChart(data, 'Y' + year)
			})

			drawRadarChart(data, 'Y1961')
		})
		function drawRadarChart(data, selectedYear) {
			d3.select('#graph10 svg').remove()

			const months = data.map(d => d.Months)
			const values = data.map(d => +d[selectedYear])
			const numAxes = months.length

			const width = 500
			const height = 500
			const radius = Math.min(width, height) / 2 - 40

			const angleSlice = (Math.PI * 2) / numAxes

			const svg = d3
				.select('#graph10')
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				.append('g')
				.attr('transform', `translate(${width / 2}, ${height / 2})`)

			const rScale = d3
				.scaleLinear()
				.domain([d3.min(values), d3.max(values)])
				.range([0, radius])

			const levels = 5
			for (let level = 0; level < levels; level++) {
				const r = ((level + 1) / levels) * radius

				svg
					.append('circle')
					.attr('r', r)
					.attr('fill', 'none')
					.attr('stroke', '#ccc')

				svg
					.append('text')
					.attr('x', 5)
					.attr('y', -r)
					.attr('fill', '#444')
					.style('font-size', '8px')
					.text(d3.format('.2f')(rScale.invert(r)))
			}

			for (let i = 0; i < numAxes; i++) {
				const angle = angleSlice * i - Math.PI / 2
				const x = radius * Math.cos(angle)
				const y = radius * Math.sin(angle)

				svg
					.append('line')
					.attr('x1', 0)
					.attr('y1', 0)
					.attr('x2', x)
					.attr('y2', y)
					.attr('stroke', '#aaa')

				svg
					.append('text')
					.attr('x', (radius + 10) * Math.cos(angle))
					.attr('y', (radius + 10) * Math.sin(angle))
					.attr('text-anchor', 'middle')
					.attr('alignment-baseline', 'middle')
					.attr('fill', '#444')
					.style('font-size', '12px')
					.text(months[i])
			}

			const line = d3
				.lineRadial()
				.radius((d, i) => rScale(values[i]))
				.angle((d, i) => angleSlice * i)

			svg
				.append('path')
				.datum(values)
				.attr('fill', 'steelblue')
				.attr('stroke', 'black')
				.attr('stroke-width', 1.5)
				.attr('fill-opacity', 0.6)
				.attr('d', line)

			values.forEach((v, i) => {
				const angle = angleSlice * i - Math.PI / 2
				const x = rScale(v) * Math.cos(angle)
				const y = rScale(v) * Math.sin(angle)

				svg
					.append('circle')
					.attr('cx', x)
					.attr('cy', y)
					.attr('r', 3)
					.attr('fill', 'darkred')

				svg
					.append('text')
					.attr('x', x + 5)
					.attr('y', y)
					.text(v.toFixed(2) + '°C')
					.style('font-size', '10px')
					.attr('fill', 'red')
			})
		}
	}

	function drawGraph11() {
		const container = d3.select('#graph11')
		container.html('').style('width', '1450px')

		const margin = { top: 60, right: 60, bottom: 50, left: 60 },
			width = 1450 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom

		const svg = container
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`)

		const tooltip = d3
			.select('body')
			.append('div')
			.style('position', 'absolute')
			.style('background', 'rgba(0,0,0,0.85)')
			.style('color', '#fff')
			.style('padding', '6px 10px')
			.style('border-radius', '5px')
			.style('font-size', '14px')
			.style('pointer-events', 'none')
			.style('opacity', 0)
			.style('z-index', '1000')

		d3.csv('tables/importantAreasStd.csv').then(data => {
			data.forEach(d => {
				d.Year = d.Year === '' ? null : +d.Year
				d['Standard Deviation'] =
					d['Standard Deviation'] === '' ? null : +d['Standard Deviation']
			})

			const xScale = d3
				.scaleLinear()
				.domain(d3.extent(data, d => d.Year))
				.range([0, width])

			const yScale = d3
				.scaleLinear()
				.domain(d3.extent(data, d => d['Standard Deviation']))
				.nice()
				.range([height, 0])

			const line = d3
				.line()
				.x(d => xScale(d.Year))
				.y(d => yScale(d['Standard Deviation']))

			// Axes
			svg
				.append('g')
				.attr('transform', `translate(0, ${height})`)
				.call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')))
				.selectAll('text')
				.style('fill', '#444')
				.style('font-size', '13px')

			svg
				.append('g')
				.call(d3.axisLeft(yScale))
				.selectAll('text')
				.style('fill', '#444')
				.style('font-size', '13px')

			svg
				.append('text')
				.attr('x', width / 2)
				.attr('y', height + 40)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Year')

			svg
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -height / 2)
				.attr('y', -45)
				.attr('text-anchor', 'middle')
				.style('font-size', '16px')
				.style('fill', '#444')
				.text('Standard deviation change')

			const areas = Array.from(new Set(data.map(d => d.Area))).sort()
			const color = d3.scaleOrdinal(d3.schemeCategory10).domain(areas)
			const nested = d3.groups(data, d => d.Area)

			const lines = svg
				.selectAll('.line')
				.data(nested)
				.enter()
				.append('path')
				.attr('class', d => `line ${d[0].replace(/\s+/g, '_')}`)
				.attr('fill', 'none')
				.attr('stroke', d => color(d[0]))
				.attr('stroke-width', 1.5)
				.attr('d', d => line(d[1]))
				.attr('opacity', 1)

			lines
				.on('mouseover', function (event, d) {
					d3.selectAll('.line').attr('opacity', 0.2)
					d3.select(this).attr('stroke-width', 4).attr('opacity', 1)

					tooltip
						.style('opacity', 1)
						.html(`<strong>${d[0]}</strong>`)
						.style('left', event.pageX + 15 + 'px')
						.style('top', event.pageY - 20 + 'px')
				})
				.on('mousemove', function (event) {
					tooltip
						.style('left', event.pageX + 15 + 'px')
						.style('top', event.pageY - 20 + 'px')
				})
				.on('mouseout', function () {
					d3.selectAll('.line').attr('opacity', 0.8)
					d3.select(this).attr('stroke-width', 1.5)
					tooltip.style('opacity', 0)
				})
		})
	}

	function drawGraph12() {
		const container = d3.select('#graph12')
		container.html('').style('width', '1450px').style('height', '800px')

		const width = 1450,
			height = 800

		const svg = container
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`)

		let angleX = 0,
			angleY = 0

		d3.csv('tables/importantAreas.csv').then(data => {
			data.forEach(d => {
				d.Year = +d.Year
				d['Temperature Change'] = +d['Temperature Change']
				d['Standard Deviation'] = +d['Standard Deviation']
			})

			const groupedData = d3.group(
				data,
				d => d.Area,
				d => d.Year
			)

			const aggregatedData = []
			groupedData.forEach((areaGroup, area) => {
				areaGroup.forEach((yearGroup, year) => {
					const avgTempChange = d3.mean(yearGroup, d => d['Temperature Change'])
					const avgStdDev = d3.mean(yearGroup, d => d['Standard Deviation'])
					aggregatedData.push({
						Area: area,
						Year: year,
						'Temperature Change': avgTempChange,
						'Standard Deviation': avgStdDev,
					})
				})
			})

			const xExtent = d3.extent(aggregatedData, d => d.Year)
			const zExtentTemp = d3.extent(
				aggregatedData,
				d => d['Temperature Change']
			)
			const zExtentStdDev = d3.extent(
				aggregatedData,
				d => d['Standard Deviation']
			)

			// Scale adjustments to make data more compact
			const xScale = d3
				.scaleLinear()
				.domain(xExtent)
				.range([-width / 4, width / 4])
			const zScaleTemp = d3.scaleLinear().domain(zExtentTemp).range([1, 150])
			const zScaleStdDev = d3
				.scaleLinear()
				.domain(zExtentStdDev)
				.range([1, 150])

			const color = d3
				.scaleOrdinal(d3.schemeCategory10)
				.domain([...new Set(aggregatedData.map(d => d.Area))])

			const points = svg
				.selectAll('circle')
				.data(aggregatedData)
				.enter()
				.append('circle')
				.attr('fill', d => color(d.Area))
				.attr('opacity', 0.8)

			function updatePoints() {
				points
					.attr(
						'cx',
						d =>
							xScale(d.Year) * Math.cos(angleX) -
							zScaleTemp(d['Temperature Change']) * Math.sin(angleX)
					)
					.attr(
						'cy',
						d =>
							xScale(d.Year) * Math.sin(angleY) +
							zScaleStdDev(d['Standard Deviation']) * Math.cos(angleY)
					)
					.attr('r', 5)
			}
			updatePoints()

			const tooltip = d3
				.select('body')
				.append('div')
				.style('position', 'absolute')
				.style('background', 'rgba(0,0,0,0.85)')
				.style('color', '#fff')
				.style('padding', '6px 10px')
				.style('border-radius', '5px')
				.style('font-size', '14px')
				.style('pointer-events', 'none')
				.style('opacity', 0)

			points
				.on('mouseover', function (event, d) {
					d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2)
					tooltip
						.style('opacity', 1)
						.html(
							`<strong>${d.Area}</strong><br>Year: ${d.Year}<br>Avg Temp Change: ${d['Temperature Change']}°C<br>Avg Std Dev: ${d['Standard Deviation']}`
						)
						.style('left', event.pageX + 15 + 'px')
						.style('top', event.pageY - 20 + 'px')
				})
				.on('mousemove', function (event) {
					tooltip
						.style('left', event.pageX + 15 + 'px')
						.style('top', event.pageY - 20 + 'px')
				})
				.on('mouseout', function () {
					d3.select(this).attr('stroke', 'none')
					tooltip.style('opacity', 0)
				})

			let isDragging = false,
				lastX,
				lastY

			container.on('mousedown', function (event) {
				isDragging = true
				lastX = event.clientX
				lastY = event.clientY
			})

			container.on('mousemove', function (event) {
				if (isDragging) {
					let dx = event.clientX - lastX
					let dy = event.clientY - lastY
					angleX += dx * 0.01
					angleY += dy * 0.01
					updatePoints()
					lastX = event.clientX
					lastY = event.clientY
				}
			})

			container.on('mouseup', function () {
				isDragging = false
			})
		})
	}

	function drawGraph13() {
		const margin = { top: 40, right: 20, bottom: 60, left: 90 },
			boxWidth = 120,
			width = 1450 - margin.left - margin.right,
			height = 500

		d3.select('#graph13').html('')

		const svg = d3
			.select('#graph13')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.style('background-color', '#e2e2e2')
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`)

		Promise.all([
			d3.csv('tables/globalStdToTem.csv'),
			d3.csv('tables/tempOutliersBySeason.csv'),
		]).then(([fullData, outliers]) => {
			fullData.forEach(d => {
				d['Temperature Change'] = +d['Temperature Change']
				d['Month'] = d['Months'].trim()
			})

			outliers.forEach(d => {
				d['Temperature Change'] = +d['Temperature Change']
				d['Month'] = d['Months'].trim()
			})

			const monthToSeason = {
				December: 'Winter',
				January: 'Winter',
				February: 'Winter',
				March: 'Spring',
				April: 'Spring',
				May: 'Spring',
				June: 'Summer',
				July: 'Summer',
				August: 'Summer',
				September: 'Fall',
				October: 'Fall',
				November: 'Fall',
			}

			fullData.forEach(d => {
				d.Season = monthToSeason[d['Month']]
			})

			const seasons = ['Winter', 'Spring', 'Summer', 'Fall']
			const x = d3.scaleBand().domain(seasons).range([0, width]).padding(1)

			const allTemps = fullData.map(d => d['Temperature Change'])
			const y = d3
				.scaleLinear()
				.domain([d3.min(allTemps), d3.max(allTemps)])
				.nice()
				.range([height, 0])

			svg
				.append('g')
				.attr('transform', `translate(0, ${height})`)
				.call(d3.axisBottom(x))
				.selectAll('text')
				.style('font-size', '14px')

			svg
				.append('g')
				.call(d3.axisLeft(y))
				.selectAll('text')
				.style('font-size', '14px')

			const boxData = d3.rollups(
				fullData,
				group => {
					const values = group
						.map(d => d['Temperature Change'])
						.sort(d3.ascending)
					const q1 = d3.quantile(values, 0.25)
					const q2 = d3.quantile(values, 0.5)
					const q3 = d3.quantile(values, 0.75)
					const iqr = q3 - q1
					const min = q1 - 1.5 * iqr
					const max = q3 + 1.5 * iqr
					return { q1, q2, q3, min, max }
				},
				d => d.Season
			)

			svg
				.selectAll('.whisker-top')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2)
				.attr('y1', d => y(d[1].q3))
				.attr('y2', d => y(d[1].max))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)

			svg
				.selectAll('.whisker-bottom')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2)
				.attr('y1', d => y(d[1].q1))
				.attr('y2', d => y(d[1].min))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)
			svg
				.selectAll('.whisker-cap-top')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 4)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2 + boxWidth / 4)
				.attr('y1', d => y(d[1].max))
				.attr('y2', d => y(d[1].max))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)

			svg
				.selectAll('.whisker-cap-bottom')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 4)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2 + boxWidth / 4)
				.attr('y1', d => y(d[1].min))
				.attr('y2', d => y(d[1].min))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)

			svg
				.selectAll('.box')
				.data(boxData)
				.enter()
				.append('rect')
				.attr('x', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 2)
				.attr('y', d => y(d[1].q3))
				.attr('width', boxWidth)
				.attr('height', d => y(d[1].q1) - y(d[1].q3))
				.attr('fill', '#4682b4')
				.attr('opacity', 0.4)
				.attr('rx', 6)

			svg
				.selectAll('.median')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 2)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2 + boxWidth / 2)
				.attr('y1', d => y(d[1].q2))
				.attr('y2', d => y(d[1].q2))
				.attr('stroke', '#333')
				.attr('stroke-width', 2)

			svg
				.selectAll('.outlier')
				.data(outliers)
				.enter()
				.append('circle')
				.attr(
					'cx',
					d =>
						x(d.Season) +
						x.bandwidth() / 2 +
						(Math.random() - 0.5) * (boxWidth * 0.6)
				)
				.attr('cy', d => y(d['Temperature Change']))
				.attr('r', 2.5)
				.attr('fill', d => (d['Outlier Type'] === 'High' ? 'crimson' : 'blue'))
				.attr('opacity', 0.6)

			svg
				.append('text')
				.attr('x', width / 2)
				.attr('y', height + 50)
				.attr('text-anchor', 'middle')
				.attr('font-size', 16)
				.attr('fill', '#444')
				.text('Season')

			svg
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -height / 2)
				.attr('y', -50)
				.attr('text-anchor', 'middle')
				.attr('font-size', 16)
				.attr('fill', '#444')
				.text('Temperature change (°C)')
		})
	}

	function drawGraph14() {
		const margin = { top: 40, right: 20, bottom: 60, left: 90 },
			boxWidth = 120,
			width = 1450 - margin.left - margin.right,
			height = 500

		d3.select('#graph14').html('')

		const svg = d3
			.select('#graph14')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.style('background-color', '#e2e2e2')
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`)

		Promise.all([
			d3.csv('tables/globalStdToTem.csv'),
			d3.csv('tables/tempStdOutliersBySeason.csv'),
		]).then(([fullData, outliers]) => {
			fullData.forEach(d => {
				d['Standard Deviation'] = +d['Standard Deviation']
				d['Month'] = d['Months'].trim()
			})

			outliers.forEach(d => {
				d['Standard Deviation'] = +d['Standard Deviation']
				d['Month'] = d['Months'].trim()
			})

			const monthToSeason = {
				December: 'Winter',
				January: 'Winter',
				February: 'Winter',
				March: 'Spring',
				April: 'Spring',
				May: 'Spring',
				June: 'Summer',
				July: 'Summer',
				August: 'Summer',
				September: 'Fall',
				October: 'Fall',
				November: 'Fall',
			}

			fullData.forEach(d => {
				d.Season = monthToSeason[d['Month']]
			})
			outliers.forEach(d => {
				d.Season = monthToSeason[d['Month']]
			})

			const seasons = ['Winter', 'Spring', 'Summer', 'Fall']
			const x = d3.scaleBand().domain(seasons).range([0, width]).padding(1)

			const boxData = d3.rollups(
				fullData,
				group => {
					const values = group
						.map(d => d['Standard Deviation'])
						.sort(d3.ascending)
					const q1 = d3.quantile(values, 0.25)
					const q2 = d3.quantile(values, 0.5)
					const q3 = d3.quantile(values, 0.75)
					const iqr = q3 - q1
					const min = q1 - 1.5 * iqr
					const max = q3 + 1.5 * iqr
					return { q1, q2, q3, min, max }
				},
				d => d.Season
			)

			const allTemps = fullData
				.map(d => d['Standard Deviation'])
				.concat(outliers.map(d => d['Standard Deviation']))
			const yMin = d3.min(allTemps)
			const yMax = d3.max(allTemps)

			const y = d3
				.scaleLinear()
				.domain([yMin - 1, yMax + 0.5])
				.nice()
				.range([height, 0])

			svg
				.append('g')
				.attr('transform', `translate(0, ${height})`)
				.call(d3.axisBottom(x))
				.selectAll('text')
				.style('font-size', '14px')

			svg
				.append('g')
				.call(d3.axisLeft(y))
				.selectAll('text')
				.style('font-size', '14px')

			svg
				.selectAll('.whisker-top')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2)
				.attr('y1', d => y(d[1].q3))
				.attr('y2', d => y(d[1].max))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)
				.attr('stroke-dasharray', '2,2')

			svg
				.selectAll('.whisker-bottom')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2)
				.attr('y1', d => y(d[1].q1))
				.attr('y2', d => y(d[1].min))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)
				.attr('stroke-dasharray', '2,2')

			svg
				.selectAll('.whisker-cap-top')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 4)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2 + boxWidth / 4)
				.attr('y1', d => y(d[1].max))
				.attr('y2', d => y(d[1].max))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)

			svg
				.selectAll('.whisker-cap-bottom')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 4)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2 + boxWidth / 4)
				.attr('y1', d => y(d[1].min))
				.attr('y2', d => y(d[1].min))
				.attr('stroke', '#333')
				.attr('stroke-width', 1.5)

			svg
				.selectAll('.box')
				.data(boxData)
				.enter()
				.append('rect')
				.attr('x', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 2)
				.attr('y', d => y(d[1].q3))
				.attr('width', boxWidth)
				.attr('height', d => y(d[1].q1) - y(d[1].q3))
				.attr('fill', '#4682b4')
				.attr('opacity', 0.4)
				.attr('rx', 6)

			svg
				.selectAll('.median')
				.data(boxData)
				.enter()
				.append('line')
				.attr('x1', d => x(d[0]) + x.bandwidth() / 2 - boxWidth / 2)
				.attr('x2', d => x(d[0]) + x.bandwidth() / 2 + boxWidth / 2)
				.attr('y1', d => y(d[1].q2))
				.attr('y2', d => y(d[1].q2))
				.attr('stroke', '#333')
				.attr('stroke-width', 2)

			svg
				.selectAll('.outlier')
				.data(outliers)
				.enter()
				.append('circle')
				.attr(
					'cx',
					d =>
						x(d.Season) +
						x.bandwidth() / 2 +
						(Math.random() - 0.5) * (boxWidth * 0.6)
				)
				.attr('cy', d => y(d['Standard Deviation']))
				.attr('r', 2.5)
				.attr('fill', d => (d['Outlier Type'] === 'High' ? 'crimson' : 'blue'))
				.attr('opacity', 0.6)

			svg
				.append('text')
				.attr('x', width / 2)
				.attr('y', height + 50)
				.attr('text-anchor', 'middle')
				.attr('font-size', '16')
				.attr('font-weight', 'medium')
				.attr('fill', '#444')
				.text('Season')

			svg
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -height / 2)
				.attr('y', -60)
				.attr('text-anchor', 'middle')
				.attr('font-size', '16')
				.attr('fill', '#444')
				.text('Standard deviation')
		})
	}

	function drawGraph15() {
		const container = d3.select('#graph15')
		container.html('').style('width', '100%').style('height', '700px')

		const width = container.node().getBoundingClientRect().width - 100,
			height = 600,
			margin = { top: 40, right: 40, bottom: 60, left: 200 }

		const svg = container
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)

		d3.csv('tables/importantAreas.csv')
			.then(data => {
				data.forEach(d => {
					d['Temperature Change'] = +d['Temperature Change']
				})

				const areaMeanTemp = d3.rollup(
					data,
					v => d3.mean(v, d => d['Temperature Change']),
					d => d.Area
				)

				const sortedData = Array.from(areaMeanTemp, ([Area, TempChange]) => ({
					Area,
					TempChange,
				})).sort((a, b) => b.TempChange - a.TempChange)

				const validData = sortedData.filter(d => !isNaN(d.TempChange))

				// Set up scales with proper domains
				const xExtent = d3.extent(validData, d => d.TempChange)
				const xDomain = [
					Math.min(xExtent[0] * 1.1, 0),
					Math.max(xExtent[1] * 1.1, 0),
				]

				const xScale = d3
					.scaleLinear()
					.domain(xDomain)
					.range([0, width - margin.left - margin.right])
					.nice()

				const yScale = d3
					.scaleBand()
					.domain(validData.map(d => d.Area))
					.range([0, height - margin.top - margin.bottom])
					.padding(0.3)

				const colorScale = d3
					.scaleLinear()
					.domain([
						d3.min(validData, d => d.TempChange),
						0,
						d3.max(validData, d => d.TempChange),
					])
					.range(['#1a5cb0', '#e0e0e0', '#c72222'])

				svg
					.selectAll('.bar')
					.data(validData)
					.enter()
					.append('rect')
					.attr('class', 'bar')
					.attr('y', d => yScale(d.Area))
					.attr('x', d => Math.min(xScale(0), xScale(d.TempChange)))
					.attr('width', d => Math.abs(xScale(d.TempChange) - xScale(0)))
					.attr('height', yScale.bandwidth())
					.attr('fill', d => colorScale(d.TempChange))
					.attr('rx', 2)
					.attr('ry', 2)

				svg
					.append('g')
					.attr(
						'transform',
						`translate(0, ${height - margin.top - margin.bottom})`
					)
					.call(d3.axisBottom(xScale).ticks(6))
					.selectAll('text')
					.attr('font-size', '12px')

				svg
					.append('text')
					.attr(
						'transform',
						`translate(${(width - margin.left - margin.right) / 2}, ${
							height - margin.top - margin.bottom + 40
						})`
					)
					.style('text-anchor', 'middle')
					.attr('fill', '#444')
					.attr('font-size', '16px')
					.text('Temperature change (°C)')

				const yAxis = svg
					.append('g')
					.call(d3.axisLeft(yScale))
					.attr('font-size', '12px')

				yAxis
					.selectAll('.tick')
					.append('rect')
					.attr('x', -margin.left + 10)
					.attr('y', -yScale.bandwidth() / 2)
					.attr('width', margin.left - 15)
					.attr('height', yScale.bandwidth())
					.attr('rx', 3)
					.attr('ry', 3)
					.lower()

				svg
					.append('line')
					.attr('x1', xScale(0))
					.attr('x2', xScale(0))
					.attr('y1', 0)
					.attr('y2', height - margin.top - margin.bottom)
					.attr('stroke', '#333')
					.attr('stroke-width', 1)
					.attr('stroke-dasharray', '2,2')
			})
			.catch(error => console.error('Error loading or processing data:', error))
	}

	// Draw the first graph by default
	drawGraph10()

	thumbnails.forEach(thumbnail => {
		thumbnail.addEventListener('click', function () {
			const graphId = this.getAttribute('onclick').match(/'([^']+)'/)[1]
			const allGraphs = [
				'graph5',
				'graph6',
				'graph7',
				'graph8',
				'graph9',
				'graph10',
				'graph11',
				'graph12',
				'graph13',
				'graph14',
				'graph15',
			]
			allGraphs.forEach(id => {
				const el = document.getElementById(id)
				if (id === graphId) {
					el.style.display = 'block'
					el.classList.add('active')
				} else {
					el.style.display = 'none'
					el.classList.remove('active')
				}
			})

			if (graphId === 'graph5') drawGraph5()
			if (graphId === 'graph6') drawGraph6()
			if (graphId === 'graph7') drawGraph7()
			if (graphId === 'graph8') drawGraph8()
			if (graphId === 'graph9') drawGraph9()
			if (graphId === 'graph10') drawGraph10()
			if (graphId === 'graph11') drawGraph11()
			if (graphId === 'graph12') drawGraph12()
			if (graphId === 'graph13') drawGraph13()
			if (graphId === 'graph14') drawGraph14()
			if (graphId === 'graph15') drawGraph15()
		})
	})
})

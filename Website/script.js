const width = 960,
	height = 600

// Select the .geo-map container in the HTML
const container = d3
	.select('.geo-map')
	.style('display', 'flex')
	.style('flex-direction', 'column')
	.style('align-items', 'center')
	.style('font-family', 'Arial, sans-serif')

const title = container
	.append('h1')
	.text('Global Temperature Changes Over Time')

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

const monthSelectContainer = container.append('div').style('margin', '10px')
const monthLabel = monthSelectContainer
	.append('label')
	.text('Select Month: ')
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

const yearSelectContainer = container.append('div').style('margin', '10px')
const yearLabel = yearSelectContainer
	.append('label')
	.text('Select Year: ')
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
	.style('margin-left', '10px')
	.text(yearSlider.node().value)

// Update the year display when the slider is moved
yearSlider.on('input', function () {
	yearDisplay.text(this.value)
	const selectedYear = this.value
	const selectedMonth = monthSelect.node().value // Get the selected month
	loadCSV('tabels/temperatureChange.csv').then(data =>
		updateMap(data, selectedYear, selectedMonth)
	)
})

monthSelect.on('change', function () {
	const selectedMonth = this.value
	const selectedYear = yearSlider.node().value
	loadCSV('tabels/temperatureChange.csv').then(data =>
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
		.scaleSequential(d3.interpolateCool)
		.domain(d3.extent(filteredData, d => +d['Temperature Change']))

	// Load the GeoJSON countries data
	const world = await d3.json(
		'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
	)
	const countries = topojson.feature(world, world.objects.countries).features

	const normalizeName = name => {
		if (name === 'Russian Federation') return 'Russia' // Handle Russia
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

			// Find matching data for the region
			const regionData = filteredData.find(
				f => normalizeName(f.Area) === regionName
			)
			if (regionData) {
				return colorScale(+regionData['Temperature Change'])
			}
			return '#ccc'
		})
		.attr('stroke', '#333')
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

// Initialize the map with the default data and filters
loadCSV('tabels/temperatureChange.csv').then(data =>
	updateMap(data, '2019', 'January')
)

d3.csv("tabels/temperatureChange.csv").then(function (data) {
	const graphContainer = d3.select("#graph1");
	graphContainer.html(""); // Clear old chart if reloaded

	// Get actual size from container
	const containerWidth = graphContainer.node().getBoundingClientRect().width;
	const containerHeight = graphContainer.node().getBoundingClientRect().height || 470;

	const margin = { top: 20, right: 30, bottom: 50, left: 60 };
	const width = containerWidth - margin.left - margin.right;
	const height = containerHeight - margin.top - margin.bottom;

	const svg = graphContainer
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);


	// title
	svg.append("text")
	.attr("x", width / 2)
	.attr("y", 0)
	.attr("text-anchor", "middle")
	.style("font-size", "18px")
	.style("font-weight", "bold")
	.style("fill", "#333")
	.text("Global average temperature change over time");

	// parsing values
	data.forEach(d => {
		d.Year = +d.Year;
		d["Temperature Change"] = +d["Temperature Change"];
	});

	// group by year and calculate global avg
	const avgByYear = d3.rollups(
		data.filter(d => !isNaN(d["Temperature Change"])),
		v => d3.mean(v, d => d["Temperature Change"]),
		d => d.Year
	);
	const globalAverages = avgByYear
		.map(([year, value]) => ({ year, value }))
		.sort((a, b) => a.year - b.year);

	console.log("Global Averages:", globalAverages);

	// setting sclaes
	const x = d3.scaleLinear()
		.domain(d3.extent(globalAverages, d => d.year))
		.range([0, width]);

	const y = d3.scaleLinear()
		.domain(d3.extent(globalAverages, d => d.value))
		.range([height, 0]);

	const line = d3
		.line()
		.x(d => x(d.year))
		.y(d => y(d.value));

	// the line on the graph
	svg.append("path")
		.datum(globalAverages)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 2)
		.attr("d", line);

	// axis
	svg.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x).tickFormat(d3.format("d")));

	svg.append("g").call(d3.axisLeft(y));

	// x axis
	svg.append("text")
	.attr("text-anchor", "end")
	.attr("x", width / 2 + margin.left)
	.attr("y", height + margin.bottom - 5)
	.text("Year")
	.style("font-size", "14px")
	.style("fill", "#333");

	// y axis
	svg.append("text")
	.attr("text-anchor", "middle")
	.attr("transform", `rotate(-90)`)
	.attr("x", -height / 2)
	.attr("y", -margin.left + 15)
	.text("Global Temperature Change (°C)")
	.style("font-size", "14px")
	.style("fill", "#333");

});

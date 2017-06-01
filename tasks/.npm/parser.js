function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function output (lines) {
  console.log(lines.join('\n'))
}

function main (args) {
	var json_result = JSON.parse(args[0])
	var all_deps = json_result.dependencies
	if (!all_deps) {
		output([])
    return
	}
	var all_normalized_deps = []
	function getDeps(dependencies) {
		var curr_deps = Object.keys(dependencies) || []
		curr_deps.forEach(function (dep) {
			var curr_dep = dependencies[dep]
			// push current dep
			all_normalized_deps.push('npm+' + dep + '$' + curr_dep.version)
			if (curr_dep.dependencies) return getDeps(curr_dep.dependencies) // recurse through nested deps
		})
	}
	getDeps(all_deps)
	all_normalized_deps = all_normalized_deps.filter(onlyUnique).sort()

	output(all_normalized_deps)
}

if (process.argv.length <= 2) {
    console.log("Error processing npm mediation");
    process.exit(-1);
}

main(process.argv.slice(2))
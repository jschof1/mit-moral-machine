var scores = {};
scores["Saved"] = {};
scores["Saved"]["genders"] = {};
scores["Saved"]["characters"] = {};
scores["Killed"] = {};
scores["Killed"]["genders"] = {};
scores["Killed"]["characters"] = {};

var counts = {};
counts["genders"] = {};
counts["characters"] = {};

$('document').ready(function(){
	nextScenario(0);
});

function nextScenario(id) {
	d3.json('data.json', function(data) {
		var next = parseInt(id) + 1;
		var scenario = parseInt(id);
		var sides = ["left","right"];
		var random = 0;
		if (scenario > 0) {
			random = Math.floor(Math.random() * 2);
		}
		if (next > 10) {
			window.setTimeout(function() { calculateResult();},500);
			$('game').fadeOut(function() {
				$('#results').fadeIn();
			});
		} else {
			$("#background-left").children().fadeOut(function() {
				this.remove();
				console.log(sides[random]);
				if (sides[random] == "left") {
					$("#background-left").css('background-image','url("img/L.png")');
					$("#background-left").html('<img id="left" scenario="'+next+'" src="img/scenarios/'+next+'-l.png"/>');
					$('#left').click(function() {
	    				updateScores($(this).attr('scenario'),false);
	    				updateCounts($(this).attr('scenario'));
	    				nextScenario($(this).attr('scenario'));
	    			});
				} else {
					$("#background-left").css('background-image','url("img/R.png")');
					$("#background-left").html('<img id="right" scenario="'+next+'" src="img/scenarios/'+next+'-r.png"/>');
					$('#right').click(function() {
			    		updateScores($(this).attr('scenario'),true);
			    		updateCounts($(this).attr('scenario'));
			    		nextScenario($(this).attr('scenario'));
			    	});
				}
			    
			});
			$("#background-right").children().fadeOut(function() {
				this.remove();
				if (sides[random] == "left") {
					$("#background-right").css('background-image','url("img/R.png")');
					$("#background-right").html('<img id="right" scenario="'+next+'" src="img/scenarios/'+next+'-r.png"/>');
					$('#right').click(function() {
			    		updateScores($(this).attr('scenario'),true);
			    		updateCounts($(this).attr('scenario'));
			    		nextScenario($(this).attr('scenario'));
			    	});
				} else {
					$("#background-right").css('background-image','url("img/L.png")');
					$("#background-right").html('<img id="left" scenario="'+next+'" src="img/scenarios/'+next+'-l.png"/>');
					$('#left').click(function() {
	    				updateScores($(this).attr('scenario'),false);
	    				updateCounts($(this).attr('scenario'));
	    				nextScenario($(this).attr('scenario'));
	    			});
				}
			});
			$("#continue-ahead").html(data.scenarios[scenario]["no-action"]["description"]);
			$("#continue-saved").html(getCharecterSummaryText(getCharecterSummary(data.scenarios[scenario]["no-action"]["saved"]["characters"])));
			$("#swerve-killed").html(getCharecterSummaryText(getCharecterSummary(data.scenarios[scenario]["no-action"]["saved"]["characters"])));
			$("#swerve").html(data.scenarios[scenario]["take-action"]["description"]);
			$("#continue-killed").html(getCharecterSummaryText(getCharecterSummary(data.scenarios[scenario]["no-action"]["killed"]["characters"])));
			$("#swerve-saved").html(getCharecterSummaryText(getCharecterSummary(data.scenarios[scenario]["no-action"]["killed"]["characters"])));
			
		}
	});
}

function getCharecterSummary(characters) {
	var done = {};
	var counts = {};
	$.each(characters, function(index,value) {
		if (!done[value]) {
			if (!Number.isInteger(counts[value])) {
				counts[value] = 1;
			} else {
				counts[value] += 1;
			}
		}
	});
	return counts;
}

function getCharecterSummaryText(counts) {
	var text = "";
	$.each(counts, function(key,value) {
		text += value + " " + key + "<br/>";
	});
	return text;
}


function calculateResult() {
	var results = {};
	console.log("scores");
	console.log(scores);
	console.log("counts");
	console.log(counts);
	results["Most killed"] = getMostSKCharacter(scores["Killed"]["characters"],counts["characters"]);
	results["Most saved"] = getMostSKCharacter(scores["Saved"]["characters"],counts["characters"]);
	renderSKCharecters("mostSaved",results["Most saved"]["characters"],results["Most saved"]["percent"]);
	renderSKCharecters("mostKilled",results["Most killed"]["characters"],results["Most killed"]["percent"]);
	results["Gender preference (saved)"] = getPreference(scores["Saved"]["genders"],counts["genders"]);
	genderPref = (((results["Gender preference (saved)"]["Male"] - results["Gender preference (saved)"]["Female"]) / 2) + 0.5) * 100;
	renderResult("right-50",5, genderPref);
	renderResult("left-50",7, getAgePeference());
	results["Save more lives"] = getScoringPercentage(scores["Save more lives"],counts["Save more lives"]);
	renderResult('left-50',1,results["Save more lives"]*100);
	results["Save passengers"] = getScoringPercentage(scores["Save people in car"],counts["Save people in car"]);
	renderResult('right-50',2,results["Save passengers"]*100);
	results["Avoid intervention"] = getScoringPercentage(scores["Avoid intervention"],counts["Avoid intervention"]);
	renderResult('left-50',4,results["Avoid intervention"]*100);
	renderResult("right-50",6, getSpeciesPeference());
	renderResult("left-50",9, getSocialPeference());
	results["Uphold law"] = getScoringPercentage(scores["Uphold law"],counts["Uphold law"]);
	renderResult('right-50',3,results["Uphold law"]*100);
	console.log("results");
	console.log(results);
}

function updateCounts(id) {
	d3.json('data.json', function(data) {
		var scenario = id - 1;
		var done = {};
		$.each(data.scenarios[scenario]["take-action"]["scoring"], function(index, value) {
			if (!done[value]) {
				if (!Number.isInteger(counts[value])) {
					counts[value] = 1;
				} else {
					counts[value] += 1;
				}
			}
		});
		$.each(data.scenarios[scenario]["no-action"]["scoring"], function(index, value) {
			if (!done[value]) {
				if (!Number.isInteger(counts[value])) {
					counts[value] = 1;
				} else {
					counts[value] += 1;
				}
			}
		});
		$.each(data.scenarios[scenario]["no-action"]["saved"]["genders"], function(index, value) {
			if (!Number.isInteger(counts["genders"][value])) {
				counts["genders"][value] = 1;
			} else {
				counts["genders"][value] += 1;
			}
		});
		$.each(data.scenarios[scenario]["no-action"]["saved"]["characters"], function(index, value) {
			if (!Number.isInteger(counts["characters"][value])) {
				counts["characters"][value] = 1;
			} else {
				counts["characters"][value] += 1;
			}
		});
		$.each(data.scenarios[scenario]["no-action"]["killed"]["genders"], function(index, value) {
			if (!Number.isInteger(counts["genders"][value])) {
				counts["genders"][value] = 1;
			} else {
				counts["genders"][value] += 1;
			}
		});
		$.each(data.scenarios[scenario]["no-action"]["killed"]["characters"], function(index, value) {
			if (!Number.isInteger(counts["characters"][value])) {
				counts["characters"][value] = 1;
			} else {
				counts["characters"][value] += 1;
			}
		});
	});
}

function updateScores(id, intervention) {
	d3.json('data.json', function(data) {
		var scenario = id - 1;
		//console.log(data);
		if (intervention) {
			$.each(data.scenarios[scenario]["take-action"]["scoring"], function(index, value) {
				if (!Number.isInteger(scores[value])) {
					scores[value] = 1;
				} else {
					scores[value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["killed"]["genders"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Saved"]["genders"][value])) {
					scores["Saved"]["genders"][value] = 1;
				} else {
					scores["Saved"]["genders"][value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["killed"]["characters"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Saved"]["characters"][value])) {
					scores["Saved"]["characters"][value] = 1;
				} else {
					scores["Saved"]["characters"][value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["saved"]["genders"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Killed"]["genders"][value])) {
					scores["Killed"]["genders"][value] = 1;
				} else {
					scores["Killed"]["genders"][value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["saved"]["characters"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Killed"]["characters"][value])) {
					scores["Killed"]["characters"][value] = 1;
				} else {
					scores["Killed"]["characters"][value] += 1;
				}
			});
		} else {
			$.each(data.scenarios[scenario]["no-action"]["scoring"], function(index, value) {
				if (!Number.isInteger(scores[value])) {
					scores[value] = 1;
				} else {
					scores[value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["killed"]["genders"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Killed"]["genders"][value])) {
					scores["Killed"]["genders"][value] = 1;
				} else {
					scores["Killed"]["genders"][value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["killed"]["characters"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Killed"]["characters"][value])) {
					scores["Killed"]["characters"][value] = 1;
				} else {
					scores["Killed"]["characters"][value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["saved"]["genders"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Saved"]["genders"][value])) {
					scores["Saved"]["genders"][value] = 1;
				} else {
					scores["Saved"]["genders"][value] += 1;
				}
			});
			$.each(data.scenarios[scenario]["no-action"]["saved"]["characters"], function(index, value) {
				//console.log(value);
				if (!Number.isInteger(scores["Saved"]["characters"][value])) {
					scores["Saved"]["characters"][value] = 1;
				} else {
					scores["Saved"]["characters"][value] += 1;
				}
			});
		}
	});	
}

function getAgePeference() {
	//console.log("Age");
	//console.log("Save young: " + scores["Save young"] + " " + getScoringPercentage(scores["Save young"],counts["Save young"]));
	//console.log("Save old: " + scores["Save old"] + " " + getScoringPercentage(scores["Save old"],counts["Save old"]));
	var agePref = getScoringPercentage(scores["Save old"],counts["Save old"]) - getScoringPercentage(scores["Save young"],counts["Save young"]);
	agePref = agePref / 2;
	agePref = agePref + 0.5;
	agePref = agePref * 100;
	return agePref;
}

function getSpeciesPeference() {
	//console.log("Species");
	//console.log("Save pets: " + scores["Save pets"] + " " + getScoringPercentage(scores["Save pets"],counts["Save pets"]));
	//console.log("Save hoomans: " + scores["Save hoomans"] + " " + getScoringPercentage(scores["Save hoomans"],counts["Save hoomans"]));
	var agePref = getScoringPercentage(scores["Save pets"],counts["Save pets"]) - getScoringPercentage(scores["Save hoomans"],counts["Save hoomans"]);
	agePref = agePref / 2;
	agePref = agePref + 0.5;
	agePref = agePref * 100;
	return agePref;
}

function getSocialPeference() {
	//console.log("Species");
	//console.log("Save pets: " + scores["Save pets"] + " " + getScoringPercentage(scores["Save pets"],counts["Save pets"]));
	//console.log("Save hoomans: " + scores["Save hoomans"] + " " + getScoringPercentage(scores["Save hoomans"],counts["Save hoomans"]));
	var agePref = getScoringPercentage(scores["Save robber"],counts["Save robber"]) - getScoringPercentage(scores["Save professional"],counts["Save professional"]);
	agePref = agePref / 2;
	agePref = agePref + 0.5;
	agePref = agePref * 100;
	return agePref;
}

function getMostSKCharacter(sk,counts) {
	var highcount = 0.0;
	var highkey = [];
	$.each(sk, function(key, value) {
		var percent = value / counts[key];
		if (percent > highcount) {
			highkey = [];
			highcount = percent;
			highkey.push(key);
		} else if (percent == highcount) {
			highkey.push(key);
		}
	});
	return {
		"characters": highkey,
		"percent": highcount
	};
}

function renderSKCharecters(element,characters,percent) {
	$.each(characters, function(key,value) {
		value = value.replace(" ","_");
		value = value.replace("(","");
		value = value.replace(")","");
		$('#'+element+ ' #'+value).show();
	});
}

function getPreference(sk,counts) {
	var highcount = 0.0;
	var highkey = {};
	$.each(sk, function(key, value) {
		//console.log(key + " " + value + " / " + counts[key]);
		var percent = value / counts[key];
		highkey[key] = percent;
	});
	return highkey;
}

function getScoringPercentage(count, total) {
	//console.log(count + " / " + total);
	if (!count) {
		return 0;
	} 
	return count / total;
}

function renderResult(element,question,result) {
	var titles = [];
	titles.push("Saving more lives");
	titles.push("Protecting passengers");
	titles.push("Upholding the law");
	titles.push("Avoiding intervention");
	titles.push("Gender preference");
	titles.push("Species preference");
	titles.push("Age preference");
	titles.push("Fitness preference");
	titles.push("Social value preference");
	//console.log(element + " " + question + " " + result);
	style = "margin-left: " + result + "%;";
	if (result > 96) {
		style += " left: 0em;"
	}
	$('.'+element).append('<sub-section id="question_'+question+'"><h1>'+titles[question-1]+'</h1><panel><left><img width="60" height="60" src="http://avgame.s3-accelerate.amazonaws.com/images/results/question'+question+'_iconleft.svg"></img></left><result><div id="you" style="'+style+'"><div id="you-bar"></div>You</div><div id="left"></div><div id="slider"></div><div id="middle"></div><div id="right"></div></result><right><img width="60" height="60" src="http://avgame.s3-accelerate.amazonaws.com/images/results/question'+question+'_iconright.svg"></img></right></panel></sub-section>');
}
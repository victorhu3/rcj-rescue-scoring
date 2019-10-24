function line_calc_score(run) {
    try {
        //console.log(run);
        let score = 0;
        let final_score;
        let multiplier = 1.0;

        let lastDropTile = 0;
        let dropTileCount = 0;

        let total_lops = 0;
        for(let i=0;i<run.LoPs.length;i++){
            total_lops += run.LoPs[i];
        }

        for (let i = 0; i < run.tiles.length; i++) {
            let tile = run.tiles[i];

            for (let j=0; j<tile.scoredItems.length;j++){
                switch (tile.scoredItems[j].item){
                    case "checkpoint":
                        let tileCount = i - lastDropTile;
                        if(typeof run.LoPs[dropTileCount] === "undefined")run.LoPs.push(0);
                        score += Math.max(tileCount * (5 - 2 * run.LoPs[dropTileCount]), 0) * tile.scoredItems[j].scored;
                        break;
                    case "gap":
                        score += 10 * tile.scoredItems[j].scored;
                        break;
                    case "intersection":
                        score += 15 * tile.scoredItems[j].scored * tile.scoredItems[j].count;
                        break;
                    case "obstacle":
                        score += 10 * tile.scoredItems[j].scored;
                        break;
                    case "speedbump":
                        score += 5 * tile.scoredItems[j].scored;
                        break;
                    case "ramp":
                        score += 10 * tile.scoredItems[j].scored;
                        break;
                    case "seesaw":
                        score += 15 * tile.scoredItems[j].scored;
                        break;
                }

            }

            if (tile.isDropTile) {
                lastDropTile = i
                dropTileCount++
            }
        }

        let error = 1;
        if (run.rescueOrder) {
            if (typeof run.LoPs[dropTileCount] === "undefined") run.LoPs.push(0);
            if (run.evacuationLevel == 1) {
                for (let victim of run.rescueOrder) {
                    if (victim.type == "K") {
                        multiplier *= Math.max(140 - (5 * run.LoPs[run.EvacuationAreaLoPIndex]), 100);
                        error *= 100;
                    } else if (victim.effective) {
                        multiplier *= Math.max(120 - (5 * run.LoPs[run.EvacuationAreaLoPIndex]), 100);
                        ;
                        error *= 100;
                    }
                }
            } else if (run.evacuationLevel == 2) {
                for (let victim of run.rescueOrder) {
                    if (victim.type == "K") {
                        multiplier *= Math.max(140 - (5 * run.LoPs[run.EvacuationAreaLoPIndex]), 100);
                        ;
                        error *= 100;
                    } else if (victim.effective) {
                        multiplier *= Math.max(140 - (5 * run.LoPs[run.EvacuationAreaLoPIndex]), 100);
                        ;
                        error *= 100;
                    }
                }
            }
            multiplier /= error;
        }


        if (run.exitBonus) {
            score += Math.max(60 - (5*total_lops),0);
        }

        // 5 points for placing robot on first droptile (start)
        // Implicit showedUp if anything else is scored
        if (run.showedUp || score > 0) {
            score += 5
        }

        final_score = Math.round(score * multiplier);

        let ret={};
        ret.raw_score = score;
        ret.score = final_score;
        ret.multiplier = multiplier;
        return ret;
    } catch (e) {

    }

}


function maze_calc_score(run) {
    let score = 0;

    let mapTiles = [];
    for (let i = 0; i < run.map.cells.length; i++) {
        let cell = run.map.cells[i];
        if (cell.isTile) {
            mapTiles[cell.x + ',' + cell.y + ',' + cell.z] = cell
        }
    }

    let victims = 0;
    let rescueKits = 0;

    for (let coord of Object.keys(run.tiles)) {
        let tile = run.tiles[coord];

        if (tile.scoredItems.speedbump && mapTiles[coord].tile.speedbump) {
            score += 5
        }
        if (tile.scoredItems.checkpoint && mapTiles[coord].tile.checkpoint) {
            score += 10
        }
        if (tile.scoredItems.rampDown && mapTiles[coord].tile.ramp) {
            score += 10
        }
        if (tile.scoredItems.rampUp && mapTiles[coord].tile.ramp) {
            score += 20
        }
        if (tile.scoredItems.steps && mapTiles[coord].tile.steps) {
            score += 5
        }

        const maxKits = {
            "H": 2,
            "S": 1,
            "U": 0,
            "Heated": 1,
            "Red": 2,
            "Yellow": 1,
            "Green": 0
        };

        if (mapTiles[coord].tile.victims.top != "None") {
            if (tile.scoredItems.rescueKits.top > 0) {
                tile.scoredItems.victims.top = true
            }
            if (tile.scoredItems.victims.top) {
                victims++
                score += mapTiles[coord].isLinear ? 10 : 25
                rescueKits += Math.min(tile.scoredItems.rescueKits.top, maxKits[mapTiles[coord].tile.victims.top])
            }
        }
        if (mapTiles[coord].tile.victims.right != "None") {
            if (tile.scoredItems.rescueKits.right > 0) {
                tile.scoredItems.victims.right = true
            }
            if (tile.scoredItems.victims.right) {
                victims++
                score += mapTiles[coord].isLinear ? 10 : 25
                rescueKits += Math.min(tile.scoredItems.rescueKits.right, maxKits[mapTiles[coord].tile.victims.right])
            }
        }
        if (mapTiles[coord].tile.victims.bottom != "None") {
            if (tile.scoredItems.rescueKits.bottom > 0) {
                tile.scoredItems.victims.bottom = true
            }
            if (tile.scoredItems.victims.bottom) {
                victims++
                score += mapTiles[coord].isLinear ? 10 : 25
                rescueKits += Math.min(tile.scoredItems.rescueKits.bottom, maxKits[mapTiles[coord].tile.victims.bottom])
            }
        }
        if (mapTiles[coord].tile.victims.left != "None") {
            if (tile.scoredItems.rescueKits.left > 0) {
                tile.scoredItems.victims.left = true
            }
            if (tile.scoredItems.victims.left) {
                victims++
                score += mapTiles[coord].isLinear ? 10 : 25
                rescueKits += Math.min(tile.scoredItems.rescueKits.left, maxKits[mapTiles[coord].tile.victims.left])
            }
        }
    }

    score += Math.min(rescueKits, 12) * 10

    score += Math.max((victims + Math.min(rescueKits, 12) - run.LoPs) * 10, 0)

    if (run.exitBonus) {
        score += victims * 10
    }



    score -= Math.min(run.misidentification*5,score);

    return score
}

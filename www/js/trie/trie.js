var mkTrie = function(label, final, forest) {
    return {
        label: label,
        final: final,
        forest: forest
    };
};

var buildTrie = function(mots) {
    var arbre = mkTrie(null, false, []);
    mots.forEach(function(mot) {
        var pointeur = arbre;
        for (var i = 0; i < mot.length; i++) {
            let ch = mot.charAt(i);

            var temp = pointeur.forest.find(function(son) {
                return son.label === ch;
            });
            if (temp == null) {
                temp = mkTrie(ch, false, []);
                pointeur.forest.push(temp);
            }
            pointeur = temp;

            if (i === mot.length - 1) {
                pointeur.final = true;
            }
        }
    });
    return arbre;
};

function findInForest(value, forest) {
    for (let node of forest) {
        if (node.label === value) {
            return node;
        }
    }
    return null;
}

function isValidInTrie(trie, word) {
    var p = trie;
    for (var i = 0; i < word.length; i++) {
        let ch = word.charAt(i);
        son = findInForest(ch, p.forest);
        console.log(ch);
        if (son != null) {
            if (word.length - 1 === i) {
                return son.final;
            } else {
                p = son;
            }
        } else {
            return false;
        }
    }
    return false;
}

var qqesMots = ["banane", "baracuda", "baraque", "chip", "chopstick"];

var testTrie = buildTrie(qqesMots);

console.log(isValidInTrie("baraque", testTrie));

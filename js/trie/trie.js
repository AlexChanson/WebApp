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
        var son = findInForest(ch, p.forest);
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

function findNodeFromWord(trie, word){
  var p = trie;
  for (var i = 0; i < word.length; i++) {
      let ch = word.charAt(i);
      var son = findInForest(ch, p.forest);
      if (son != null) {
          if (word.length - 1 === i) {
              return son;
          } else {
              p = son;
          }
      } else {
          return null;
      }
  }
  return false;
}

function collapseTrie(f, trie){
  return f(trie.final, trie.label, [].concat.apply([], trie.forest.map(x => collapseTrie(f, x) ) ) );
}

function formWords(final, label, wordsEnds){
  let temp = wordsEnds.map(x => label+x);
  if (final){
    temp.push(label);
    return temp;
  }
  else {
    return temp;
  }
}

function findPossibleEnds(trie, word){
  var son = findNodeFromWord(trie, word);
  return collapseTrie(formWords, son).map(x => word + x.substr(1));
}

var qqesMots = ["banane", "baracuda", "baraque", "chip", "chopstick"];

var testTrie = buildTrie(qqesMots);

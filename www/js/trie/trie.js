
mkTrie = function(label, final, forest) {
  return {
    label: label,
    final: final,
    forest: forest
  };
};

buildTrie = function(mots){
  var arbre = mkTrie(null, false, []);
  mots.forEach(function(mot){
    var pointeur = arbre;
    for (var i = 0; i < mot.length; i++) {
      let ch = mot.charAt(i);

      var temp = pointeur.forest.find(function(son) {
        return son.label === ch;
      });
      if (temp == null){
        temp = mkTrie(ch, false, []);
        pointeur.forest.push(temp);
      }
      pointeur = temp;

      if (i === mot.length - 1){
        pointeur.final = true;
      }
    }
  });
  return arbre;
};

var qqesMots = ["banane","baracuda", "baraque","chip", "chopstick"];

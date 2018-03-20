
mkTrie = function(label, final, forest) {
  return {
    label: label,
    final: final,
    forest: forest
  };
}

buildTrie = function(mots){
  var arbre = null;
  mots.foreach(function(mot){
    var pointeur = arbre;
    for (var i = 0; i < str.length; i++) {
      let ch = str.charAt(i);
      if (pointeur == null){
        arbre = mkTrie(ch, false, []);
        pointeur = arbre;
      }
      else {
        var temp = pointer.forest.find(function(son){
          return son.label === ch;
        });
        if (temp == null){
          temp = mkTrie(ch, false, []);
          pointeur.forest.push(temp);

        }
        pointeur = temp;
      }
      if (i === mot.length - 1){
        pointeur.final = true;
      }
    }
  });
}

var qqesMots = ["banane","baracuda", "baraque","chip", "chopstick"]

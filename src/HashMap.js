/**
 * Simple classe HashMap
 */
var HashMap = function() {
 this._size = 0;
 this._map = {};
};

HashMap.prototype = {

 /**
  * Encode la paire cl�/valeur dans la table,   
  * en �crasant les entr�es existantes.
  */
 put: function(key, value) {
   if (!this.containsKey(key)) {
     this._size++;
   }
   this._map[key] = value;
 },
 
 /**
  * Supprime l'entr�e associ�e � la cl�
  * et retourne la valeur supprim�e.
  */
 remove: function(key) {
   if (this.containsKey(key)) {
     this._size--;
     var value = this._map[key];
     delete this._map[key];
     return value;
   } else {
     return null;
   }
 },
 
 /**
  * V�rifie que la table contient la cl�.
  */
 containsKey: function(key) {
   return this._map.hasOwnProperty(key);
 },
 
 /**
  * V�rifie que la table contient la valeur.
  * Notez que cette valeur peut ne pas �tre unique.
  */
 containsValue: function(value) {
   for (var key in this._map) {
     if (this._map.hasOwnProperty(key)) {
       if (this._map[key] === value) {
         return true;
       }
     }
   }

   return false;
 },
 
 /**
  * Retourne la valeur associ�e � la cl�.
  */
 get: function(key) {
   return this.containsKey(key) ? this._map[key] : null;
 },
 
 /**
  * Vide toutes les entr�es de la table.
  */
 clear: function() {
   this._size = 0;
   this._map = {};
 },
 
 /**
  * Retourne un tableau de toutes les cl�s dans la table.
  */
 keys: function() {
   var keys = [];
   for (var key in this._map) {
     if (this._map.hasOwnProperty(key)) {
       keys.push(key);
     }
   }
   return keys;
 },
 
 /**
  * Retourne un tableau de toutes les valeurs dans la table.
  */
 values: function() {
   var values = [];
   for (var key in this._map) {
     if (this._map.hasOwnProperty(key)) {
       values.push(this._map[key]);
     }
   }
   return values;
 },
 
 /**
  * Retourne la taille de la table,
  * qui correspond au nombre de cl�s.
  */
 size: function() {
   return this._size;
 }
};
/**
 * FILE : lemma-util.js
 * DESCRIPTION : Contains relevant functions to the implementation of lemmas.
 */

/**
 * ### Converts a object on the graph to it's abstract wildcard representation
 * 
 * ## Parameters
 * @param {Array<Cell>} models - The origin subgraph.
 * @param {Array} [map] - (OPTIONAL) The array that maps each wildcard value to a literal value
 * 
 * ## Returns
 * @returns {Array} - The object representing the wildcard representation (*see below for example*)
 * 
 * ## Example Representation
 * 
 * The following example is for an implication.
 * For the unfamiliar, this is a atomic statement and cut with another atomic statement on the same level.\
 * [\
 *    0 : 0,\
 *    1 : [\
 *          0 : 1,\
 *        ],\
 * ]\
 * As you can see, the representation of the object uses the letters of the alphabet to represent the unique atomic statements.\
 * If the optional map argument is passed, the wildcard values will be assigned as such. If the map does not define all variables, it will return -1 \
 * For example, if we did an implication and provided the map [P,Q], we would get...\
 * [\
 *    0 : P,\
 *    1 : [\
 *          0 : Q,\
 *        ],\
 * ]\
 */
function toWildcard( models, map ) {
  let wildcard = [];     //  Wildcard representation
  let atomic_map = map || [];   //  Map of wildcard values to atomic statemets

  models.array.forEach(  ( model ) => {
    if( model.__proto__.constructor.name === "Premise" ) {
      /*  Premise */
      let atomic_index = atomic_map.indexOf(model.attributes.attrs.text.text);

      if( atomic_index === -1 )
      {
        if( map ) {
          console.error('Mismatch between models and map passed to "toWildcard", unmounting map');
          return toWildcard( models );
        }
        atomic_map.append(model.attributes.attrs.text.text);
        atomic_index = atomic_map.indexOf(model.attributes.attrs.text.text);
      }
      wildcard.append(atomic_map[atomic_index]);
    } else if( model.__proto__.constructor.name === "Cut" ) {
      /*  Cut */
      wildcard.append( toWildcard( [model] ) );
    } else {
      console.error(`Issue in toWildcard(), unfamiliar refrance to object ${model.__proto__.constructor.name}`);
    }
  });
  return wildcard;
}


/**
 * Returns the number of atomic statements in a wildcard lemma
 * @param {Array} wildcard The wildcard, format specified in toWildcard()
 * @returns {int} The number of atomic statements in a wildcard lemma
 */
function numAtomic( wildcard ) {
  let atomic = new Set();
  let queue = [];
  queue.push(wildcard);

  while( queue.length !== 0 ) {
    let arr = queue.shift();

    arr.forEach( ( element ) => {
      if( Array.isArray(element) ) queue.push(element);
      else atomic.add(element);
    } );
  }
  return atomic.length;
}

/**
 * ###  Compares models to wildcard based on a map
 * 
 * ## Parameters
 * @param {Array<Cell>} models The models to be compared to the wildcard
 * @param {Array} wildcard The wildcard lemma, format specified in toWildcard()
 * @param {Array} map The array that maps each wildcard value to a literal value
 * 
 * ## Returns
 * @returns {Boolean} True if the models and wildcard match
 */
function compareToWildcard ( models, wildcard, map ) {
  /*  Check that they have the same number of elements */
  if( models.length !== wildcard.length ) return false;
  /* Check that the map specifies all premises in wildcard */
  if (wildcard.numAtomic !== map.length) {
    console.error('Map passed does not match length of wildcard passed, returning false');
    return false;
  }

  let model_wildcard = toWildcard( models, map );
  /*  TODO  : Complete this*/
}

function saveLemma() {

}

function loadLemma() {
  
}
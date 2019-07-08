const Helpers = {
  indexOf(collection, target) {
    for (let i = 0; i < collection.length; i++) {
      if (collection[i] === target) {
        return i;
      }
    }
    return -1;
  },
  getRouteRelationship(source, destination) {
    //  return strings 'connected', 'eligible', or 'ineligible'
    //  connected if the destination is the destination of the source
    //  ineligible if the destination leads back to the source
    //  eligible otherwise
    if (source.dest === destination) {
      return 'connected';
    } else if (Helpers.isNodeLoop(source, destination)) {
      return 'ineligible';
    } else {
      return 'eligible';
    }
  },
  isNodeLoop(source, destination) {
    while(destination) {
      if (source === destination) {
        return true;
      }
      destination = destination.dest;
    }
    return false;
  }
}
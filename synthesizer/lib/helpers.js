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

export default Helpers;
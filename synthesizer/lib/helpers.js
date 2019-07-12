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
  },
  LL: {
    removeHead(list) {
      if (list.head !== list.tail) {
        list.head = list.head.next;
      } else {
        list.head = null;
      }
      return list.head;
    },
    addToTail(list, node) {
      if (!list.head) {
        list.head = node,
        list.tail = node
        list.head.next = list.tail;
      } else {
       list.tail.next = node;
       list.tail = node; 
      }
    }
  }
}

export default Helpers;
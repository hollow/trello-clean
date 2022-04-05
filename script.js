var observer;

function observe(node) {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(onChange);
  observer.observe(node, {
    childList: true,
    subtree: true,
  });
}

function onChange(changes) {
  for (let change of changes) {
    // onNodeAdd(change.target);
    for (let node of change.addedNodes) {
      onNodeAdd(node);
    }
  }
}

function onNodeAdd(node) {
  if (node.nodeType != Node.ELEMENT_NODE) {
    // do nothing
  } else if (node.nodeName === "svg") {
    // do nothing
  } else if (node.classList?.contains("board-wrapper")) {
    observe(node.parentNode);
    onBoardAdd(node);
  } else if (node.classList?.contains("badge")) {
    onBadgeAdd(node);
  } else if (node.classList?.contains("list-card-details")) {
    addBadges(node);
  } else if (node.nodeName === "SPAN") {
    addBadges(node);
  } else {
    addBadges(node);
  }
}

function onBoardAdd(board) {
  let boardUrl = new URL(window.location.href);
  let boardPath = boardUrl.pathname.split("/");
  let boardId = boardPath[2];

  for (let list of board.querySelectorAll(".js-list")) {
    addCollapse(list, boardId);
  }
}

function addCollapse(list, boardId) {
  let listHeaderName = list.querySelector(".list-header-name");
  let listId = boardId + ":" + encodeURI(listHeaderName.textContent);

  chrome.storage.local.get([listId], (isCollapsed) => {
    onCollapse(list, listId, isCollapsed[listId]);
  });

  let toggleButton = document.createElement("div");
  toggleButton.className = "collapse-toggle";
  toggleButton.addEventListener("click", () => {
    let isCollapsed = list.classList?.contains("collapsed");
    onCollapse(list, listId, isCollapsed ? null : true);
  });

  let listHeader = list.querySelector(".list-header");
  listHeader.insertBefore(toggleButton, listHeaderName);
}

function onCollapse(list, listId, isCollapsed) {
  chrome.storage.local.set({ [listId]: isCollapsed }, () => {
    if (isCollapsed) {
      list.classList.add("collapsed");
    } else {
      list.classList.remove("collapsed");
    }
  });
}

var iconBlacklist = [
  /app\.screenful\.me\/integrations\/trello-scaled/,
  /confluence\.trello\.services\/images\/confluence-logo/,
  /github\.trello\.services\/images\/icon/,
  /github\.trello\.services\/images\/pull-request/,
  /static.kanbhala.com/, // Time Tracker
];

function onBadgeAdd(badge) {
  let icon = badge.querySelector(".badge-icon[style]");
  let iconImage = icon?.style?.backgroundImage;
  if (iconImage && iconBlacklist.some((x) => x.test(iconImage))) {
    badge.classList.add("hidden");
  }
}

function addBadges(node) {
  for (let badge of node.querySelectorAll(".badge")) {
    onBadgeAdd(badge);
  }
}

observe(document);

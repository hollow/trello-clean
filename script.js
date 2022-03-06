function onChange(changes) {
    for (let change of changes) {
        for (let node of change.addedNodes) {
            onNodeAdd(node);
        }
    }
}

function onNodeAdd(node) {
    if (node.nodeType != Node.ELEMENT_NODE) {
        return;
    }

    if (node.classList?.contains("board-wrapper")) {
        onBoardAdd(node);
    } else if (node.classList?.contains("badge")) {
        onBadgeAdd(node);
    } else {
        for (let badge of node.querySelectorAll(".badge")) {
            onBadgeAdd(badge);
        }
    }
}

function onBoardAdd(board) {
    let boardUrl = new URL(window.location.href);
    let boardPath = boardUrl.pathname.split("/");
    let boardId = boardPath[2];

    board.querySelectorAll(".js-list").forEach(list => {
        onListAdd(list, boardId);
    });
}

function onListAdd(list, boardId) {
    let listHeaderName = list.querySelector(".list-header-name");
    let listId = boardId + ":" + encodeURI(listHeaderName.textContent);

    chrome.storage.local.get([listId], isCollapsed => {
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


var badgeBlacklist = [
    "app.screenful.me/integrations/trello-scaled",
    "confluence.trello.services/images/confluence-logo",
    "github.trello.services/images/icon",
    "github.trello.services/images/pull-request",
    "static.kanbhala.com", // Time Tracker
]

function onBadgeAdd(badge) {
    switch (badge.title) {
        case "Attachments":
        case "Checklist items":
        case "Comments":
        case "This card has a description.":
        case "Trello attachments":
        case "You are subscribed to this card.":
        case "You are watching this card.":
            badge.style.display = "none";
            return;
    }

    let icon = badge.querySelector(".badge-icon");
    if (icon?.style?.backgroundImage) {
        for (let match of badgeBlacklist) {
            if (icon?.style?.backgroundImage?.includes(match)) {
                badge.style.display = "none";
                return;
            }
        }
    }
}

new MutationObserver(onChange).observe(document, {
    childList: true,
    subtree: true
});

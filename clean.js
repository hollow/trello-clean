function cleanNode(node) {
    let title = node.getAttribute("title");
    switch (title) {
        case "Attachments":
        case "Checklist items":
        case "Comments":
        case "This card has a description.":
        case "Trello attachments":
        case "You are subscribed to this card.":
        case "You are watching this card.":
            node.remove();
            return;
    }

    let cld = node.firstElementChild;
    if (cld.classList.contains("badge-icon")) {
        node.remove();
        return;
    }
}

let observer = new MutationObserver(mutations => {
    for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
            if (node.nodeName === "DIV") {
                if (node.classList.contains("badge")) {
                    cleanNode(node);
                }
            }
        }
    }
});

observer.observe(document, { childList: true, subtree: true });

export async function getEntity(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}`);
    return await res.json();
}

export async function submitContentBlockEdition(entID, user, contentBlock, newContent) {

    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/` + entID + "/" + contentBlock.ID + "?HTML=True&username=" + user, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function submitNewContentBlock(entID, user, newContent) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/` + entID + "?HTML=True" + "&username=" + user, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function createEntity(name, user, type, parent) {
    const newEntity = {
        name, user, type, parent
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newEntity)
    });

    return response.status === 201;
}

export async function deleteEntity(entID) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entID}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },

    });

    return response.status === 201;
}

export async function createLibrary(name, user) {
    const newLibrary = {
        name, user
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/add_library`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newLibrary)
        });

        if (response.status === 201) {
            return True
        } else {
            const errorDetails = await response.json();
            console.log("Error creating new Library", errorDetails);
            return errorDetails.detail;
        }

    } catch (error) {
        console.error("Error creating new Library", error);
        return error.message;
    }
}

export async function getUsers() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/properties/users`);

    if (response.status === 201) {
        const data = await response.json();
        return JSON.parse(data);
    } else {
        return null;
    }
}

export async function setUserColor(email, color) {
    // Ensure the color is properly encoded for the URL
    const encodedColor = encodeURIComponent(color);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/properties/users/${email}?color=` + encodedColor, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (response.status === 201) {
        return true;
    } else {
        return null;
    }

}

export async function getLibraryStructure(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities?ID=${id}`);
    return await res.json();
}

// FIXME: Handle errors properly
export async function getLibraries() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/get_all_libraries`);
    return await res.json();
}

export async function getNotebookParent(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/notebook_parent`);
    return res.json();
}

// Function to arrange the comments and child entities in order of their creation time.
export const sortAndFilterChildren = (entity, displayChildren, onlyShowBookmarked) => {
    let combinedArray = [];
    if (entity !== null && displayChildren !== null) {
        combinedArray = [...entity.comments, ...displayChildren];
        combinedArray.sort((a, b) => {
            const timeA = a.created ? new Date(a.created) : new Date(a.start_time);
            const timeB = b.created ? new Date(b.created) : new Date(b.start_time);
            return timeA - timeB;
        });

        if (onlyShowBookmarked) {
            combinedArray = combinedArray.filter(item => item.com_type || item.bookmarked);
        }
    }
    return combinedArray
};


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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/add_library`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newLibrary)
    });

    return response.status === 201;
}



export async function updateEntity(entityId, updates, username, isHTML = false, sendAsString = false) {
    try {
        const bodyContent = sendAsString ? updates : JSON.stringify(updates);
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entityId}?username=${encodeURIComponent(username)}&HTML=${isHTML}`;
        
        console.log('Making PATCH request to:', url);
        console.log('With body:', bodyContent);
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: bodyContent,
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));

        // Log the raw response
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            throw new Error(`Failed to update entity with status: ${response.status}. Response: ${responseText}`);
        }

        // Try to parse as JSON if it's JSON content
        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            result = responseText;
        }
        return result;

    } catch (error) {
        console.error("Detailed error in updateEntity:", {
            message: error.message,
            stack: error.stack,
            status: error.response?.status,
        });
        throw error;
    }
}
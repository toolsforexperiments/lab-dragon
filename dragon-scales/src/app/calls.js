export async function getEntity(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}`);
    
    if (res.status === 201) {
        return await res.json();
    } else {
        return null;
    }

}

export async function submitContentBlockEdition(entID, user, contentBlockId, newContent) {

    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/` + entID + "/" + contentBlockId + "?&user=" + user, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function submitNewContentBlock(entID, user, newContent, under_child) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entID}?user=${user}&under_child=${under_child}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function deleteContentBlock(entID, contentBlockId) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entID}/${contentBlockId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },

    });

    return response.status === 200;
}

export async function createEntity(name, user, type, parent, under_child) {
    // Breaking naming convention here to match the API.
    const newEntity = {
        name, user, type, parent, under_child,
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


export async function editEntityName(entID, newName) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entID}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({new_name: newName})
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
            return true
        } else {
            const errorDetails = await response.json();
            console.error("Error creating new Library", errorDetails);
            return false;
        }

    } catch (error) {
        console.error("Error creating new Library", error);
        return false;
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
    if (res.status === 200) {
        return await res.json();
    } else {
        return null;
    }

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


export async function addImageBlock(id, user, image, under_child) {
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/add_image_block?user=${user}&under_child=${under_child}`, {
        method: "PUT",
        body: formData
    });

    return response.status === 201;
}

export async function editImageBlock(id, contentBlockId, user, image=null, title=null) {
    const formData = new FormData();
    formData.append("image", image);
    let query = `user=${user}`;
    if (title) {
        query += `&title=${title}`;
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/${contentBlockId}?${query}`, {
        method: "POST",
        body: formData
    });

    return response.status === 201;
}


export async function getBuckets() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/data/buckets`);

    if (res.status === 201) {
        return await res.json();
    } else {
        return null;
    }
}


export async function createBucket(name, user, location = '') {
    const params = new URLSearchParams({
        name,
        user,
        location
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/data/buckets?${params}`, {
        method: 'POST',
    });

    // This means the location where the bucket is being created does not exist.
    if (response.status === 401) {
        return null;
    }
    
    return response.status === 201;
}


export async function targetBucket(entId, bucketId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entId}/target_bucket?bucket_ID=${bucketId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
        });

   return res.status === 201;
}


export async function unsetTargetBucket(entId, bucketId) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entId}/unset_target/${bucketId}`);

   return res.status === 201;
}


export async function getImageSuggestions(entId, query){
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/properties/graphic_suggestions/${entId}?query_filter=${query}`);

    if (res.status === 201) {
        return await res.json();
    } else {
        return null;
    }
}


export async function addImageLinkBlock(id, user, image_path, instance_id, under_child=null) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/add_image_link_block?user=${user}&image_path=${image_path}&instance_id=${instance_id}&under_child=${under_child}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
    });

    return response.status === 201;
}


export async function addComment(id, user, comment, contentBlockId=null) {
    let query = `user=${user}`;
    if (contentBlockId) {
        query += `&content_block_id=${contentBlockId}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/add_comment?${query}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({comment})
    });

    return response.status === 201;
}


export async function addCommentReply(id, commentId, user, reply) {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/add_comment_reply/${commentId}?user=${user}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"reply_body": reply})
    });

    return response.status === 201;

}


export async function resolveComment(id, commentId) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}/resolve_comment/${commentId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    });

    return response.status === 201;
}

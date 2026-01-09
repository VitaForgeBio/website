function handleRouting(e) {
    e.preventDefault();
    const selection = document.getElementById('interestSelect').value;
    let targetEmail = "";

    // --- ROUTING LOGIC ---
    // In a real backend, this would route to different lists (e.g., Mailchimp tags or CRM pipelines).
    if (selection === 'biotech') {
        targetEmail = "assets@vitaforge.bio";
        alert("Routing to Asset Management Team: " + targetEmail);
    } else if (selection === 'treasury') {
        targetEmail = "treasury@vitaforge.bio";
        alert("Routing to Treasury Operations Team: " + targetEmail);
    } else {
        targetEmail = "info@vitaforge.bio";
        alert("Routing to General Inquiries: " + targetEmail);
    }

    // Simulating form submission
    console.log(`Form submitted to ${targetEmail}`);
    document.getElementById('investorForm').reset();
}

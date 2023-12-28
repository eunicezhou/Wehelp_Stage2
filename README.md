# Taipei Day Trip
website URL : http://52.198.121.57:3000

# About this project
This website is built upon a frontend-backend separated architecture. Moreover, it follows RESTful API design principles and seamlessly integrates financial services.

### Upon load in this page
I employ CSS animations to generate dynamic effects for the HTML elements on the index page.

![Alt text](<index_page (1).gif>)

Also, I have implemented lazy loading to optimize the loading of data on the website.

![Alt text](lazyload_1.gif)

Responsive web design (RWD) ensures that this website adapts seamlessly to various screen sizes and monitors.

![Alt text](<rwd (1).gif>)

### Search attraction

Designing the database structure in accordance with the principles of database normalization.
Additionally, establishing indexes on these tables enhances search efficiency.

![Alt text](image.png)

![Alt text](search.gif)

### Carousel images

![Alt text](carousel_images.gif)

### Order trip

I utilize Tappay as my Third-party financial transactions. As user paying successfully, web page will lead to the order success and history page.

![Alt text](order.gif)

# Project Struct

![Alt text](image-1.png)

### Explanation about the user route
- The user's request goes through VPC, and enters the EC2 instance, which serves as the virtual server hosting the website. The EC2 instance is responsible for handling user requests and interacting with other services.
- 
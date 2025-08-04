from .auth_routes import auth_bp
from .analyze_routes import analyze_bp
from .presenters_routes import presenters_bp
from .publish_routes import publishers_bp
from routes.content_routes import content_bp
from routes.data_collection_routes import data_collection
from routes.remote_routes import remote_bp
from .bots_routes import automation_bp
from routes.access_control_routes import access_control_bp
from routes.assess_routes import assess_bp
from routes.publisher_routes import publish_bp  
def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(analyze_bp, url_prefix='/api')
    app.register_blueprint(presenters_bp, url_prefix='/api')
    app.register_blueprint(publishers_bp, url_prefix='/api') 
    app.register_blueprint(content_bp, url_prefix='/api')
    app.register_blueprint(data_collection, url_prefix='/api')
    app.register_blueprint(remote_bp, url_prefix='/api')
    app.register_blueprint(automation_bp, url_prefix='/api')
    app.register_blueprint(access_control_bp, url_prefix='/api')
    app.register_blueprint(assess_bp)
    app.register_blueprint(publish_bp, url_prefix="/api")

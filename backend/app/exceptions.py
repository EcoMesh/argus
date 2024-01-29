class JSONException(Exception):
    def __init__(self, code: int, body=dict):
        self.code = code
        self.body = body
        super().__init__(self, body.get("msg", "JSONException"))
